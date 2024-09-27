import {injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {admin} from '../firebase-config';
import {CredentialRepository,UserRepository} from '../repositories';



@injectable()
export class PushNotificationService {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(CredentialRepository)
    public credentialRepository: CredentialRepository,) {
  }



  async registerToken(userId:string,token:string):Promise<void>{
    const payload:any = {
      key:"fcmPushNotificationToken",
      userId:userId,
      value:token
    }
    const credential = await this.credentialRepository.findOne({where:payload})
    if(!credential){
      this.credentialRepository.create(payload)
    }
  }

  async notifyUser(userId:string, payload:any){
    const devices = await this.credentialRepository.find({where:{userId,key:"fcmPushNotificationToken"}}) || [];
    // const tokens = devices?.map((device:any)=> device.value);
    for(let device of devices){
      try{
        const token = device.value;
        await this.sendPushNotification(token,payload)
      }catch(ex){
        await this.credentialRepository.deleteById(device.id)
      }
    }
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
      // console.error('Error sending message:', error);
      // throw error;
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
