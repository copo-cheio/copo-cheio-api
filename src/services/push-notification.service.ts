import {injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {admin} from '../firebase-config';
import {Credential} from '../models';
import {CredentialRepository, UserRepository} from '../repositories';

export const PUSH_NOTIFICATION_SUBSCRIPTIONS: any = {
  checkIn: {
    user: [
      (placeId: string, eventId: string, balconyId: string) =>
        'STOCK_UPDATES__' + balconyId,
    ],
    staff: [
      (placeId: string, eventId: string, balconyId: string) =>
        'ORDER_UPDATES__' + balconyId,
      (placeId: string, eventId: string, balconyId: string) =>
        'NEW_ORDER__' + balconyId,
      (placeId: string, eventId: string, balconyId: string) =>
        'STOCK_UPDATES__' + balconyId,
    ],
  },
};
@injectable()
export class PushNotificationService {
  constructor(
    @repository('UserRepository')
    public userRepository: UserRepository,
    @repository('CredentialRepository')
    public credentialRepository: CredentialRepository,
  ) {}

  async registerToken(userId: string, token: string): Promise<void> {
    /*    const payload: any = {
      key: 'fcmPushNotificationToken',
      userId: userId,
      value: token,
    }; */
    const user = await this.userRepository.updateById(userId, {
      pushNotificationToken: token,
    });
    return user;
    /*    const credential = await this.credentialRepository.findOne({
      where: payload,
    });
    if (!credential) {
      this.credentialRepository.create(payload);
    } */
  }

  async notifyUser(userId: string, notification: any, data: any = {}) {
    const devices = await this.userRepository.findById(userId);
    /*      (await this.credentialRepository.find({
        where: {userId, key: 'fcmPushNotificationToken'},
      })) || []; */
    // console.log({ devices, userId, notification });
    // const tokens = devices?.map((device:any)=> device.value);
    // data = this.parseData(data);
    for (const device of [devices]) {
      try {
        const token = device.pushNotificationToken;
        await this.sendPushNotification(token, notification, data);
        console.log('passou');
      } catch (ex) {
        console.log('N passou', device);
        /*  try {
          await this.credentialRepository.deleteById(device.id);
          console.log(' n passou');
        } catch (ex) {
          console.log('falou cred');
        } */
      }
    }
  }

  async sendDataNotification(token: string, data: any = {}) {
    try {
      data = this.parseData(data);

      await admin.messaging().send({
        token: token,

        data: data,
      });
    } catch (error) {
      console.error('Error sending data message:', error);
      throw error;
    }
  }

  async sendTopicNotification(
    topic: string, // admin.messaging.Message,
    data: any = {},
  ): Promise<void> {
    try {
      // @ts-ignore
      data = this.parseData(data);
      await admin.messaging().send({
        topic: topic,
        data: data,
      });

      // });
      console.log('Successfully sent TOPIC message.', topic);
    } catch (error) {
      // console.warn(error);
      console.error('Error sending TOPIC MESSAGE:', topic, error);
      // throw error;
    }
  }
  // Method to send a push notification
  async sendPushNotification(
    token: string,
    notification: any = {body: '', title: ''}, // admin.messaging.Message,
    data: any = {},
  ): Promise<void> {
    try {
      // @ts-ignore
      data = this.parseData(data);

      await admin.messaging().send({
        token: token,
        notification,
        data: data,
      });

      // });
      console.log('Successfully sent message.');
    } catch (error) {
      console.warn(error);

      // console.error('Error sending message:', error);
      // throw error;
    }
  }

  // Method to send push notifications to multiple devices
  async sendPushNotifications(
    tokens: string[],
    notification: any = {}, // admin.messaging.MessagingPayload,
    data: any = {},
  ): Promise<void> {
    try {
      data = this.parseData(data);
      const response = await admin.messaging().sendEach(
        tokens.map(token => {
          return {
            token,
            notification: notification?.notification || notification,
            data,
          };
        }),
      );

      console.log(
        tokens,
        JSON.stringify(response),
        `${response} messages were sent successfully`,
      );
      if (response.failureCount > 0) {
        console.log(`${response.failureCount} messages failed to send.`);
      }
    } catch (error) {
      console.error('Error sending multicast message:', error);
      throw error;
    }
  }

  /**
   * Subscribe staff to balcony events so they can be aware of changes in the oders
   * Subscribe users to stock rupture events so they can no longer order some item
   * @param token
   * @param topic
   */
  async subscribeToTopic(userId: string, topic: string) {
    try {
      const tokens: string[] | any = await this.getDevices(userId, true);
      const response = await admin.messaging().subscribeToTopic(tokens, topic);
      console.log('Successfully subscribed to topic:', response);
    } catch (ex) {
      console.log('Error subscribing to topic:', ex);
    }
  }

  async unSubscribeFromTopic(userId: string, topic: string) {
    try {
      const tokens: string[] | any = await this.getDevices(userId, true);
      const response = await admin
        .messaging()
        .unsubscribeFromTopic(tokens, topic);
      console.log('Successfully unsubscribed from topic:', response);
    } catch (ex) {
      console.log('Error unsubscribing from topic:', ex);
    }
  }

  private async getDevices(userId: string, tokenOnly: boolean = false) {
    let devices: string[] | Credential[] = await this.credentialRepository.find(
      {
        where: {userId, key: 'fcmPushNotificationToken'},
      },
    );
    devices = devices || [];
    if (tokenOnly) {
      devices = devices.map((device: any) => device.toJSON().value);
    }
    return devices;
  }

  private parseData(data: any = {}) {
    data = {
      action: data?.action || 'NONE',
      payload: JSON.stringify(data.payload || {}),
    };

    return data;
  }
}
