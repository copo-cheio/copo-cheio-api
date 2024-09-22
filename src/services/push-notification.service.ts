import {injectable} from '@loopback/core';
import {admin} from '../firebase-config';

// @injectable({scope: BindingScope.TRANSIENT})
// export class PushNotificationService {
//   constructor(/* Add @inject to inject parameters */) {}

//   /*
//    * Add service methods here
//    */
// }

// // import * as admin from '..firebase-admin';


@injectable()
export class PushNotificationService {
  constructor() {
    // Initialize Firebase Admin SDK
    // const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');

    // if (admin.apps.length === 0) {
    //   admin.initializeApp({
    //     credential: admin.credential.cert(serviceAccountPath),
    //   });
    // }
  }

  // Method to send a push notification
  async sendPushNotification(token: string, payload: admin.messaging.Message): Promise<void> {
    try {
      await admin.messaging().send({
        token: token,
        ...payload,
      });
      console.log('Successfully sent message.');
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Method to send push notifications to multiple devices
  async sendPushNotifications(tokens: string[], payload: admin.messaging.MessagingPayload): Promise<void> {
    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens: tokens,
        notification: payload.notification,
        data: payload.data,
      });

      console.log(`${response.successCount} messages were sent successfully`);
      if (response.failureCount > 0) {
        console.log(`${response.failureCount} messages failed to send.`);
      }
    } catch (error) {
      console.error('Error sending multicast message:', error);
      throw error;
    }
  }


}
