import {injectable} from "@loopback/core";
import {repository} from "@loopback/repository";
import {admin} from "../firebase-config";
import {CredentialRepository,UserRepository} from "../repositories";

@injectable()
export class PushNotificationService {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(CredentialRepository)
    public credentialRepository: CredentialRepository
  ) {}

  async registerToken(userId: string, token: string): Promise<void> {
    const payload: any = {
      key: "fcmPushNotificationToken",
      userId: userId,
      value: token,
    };
    const credential = await this.credentialRepository.findOne({
      where: payload,
    });
    if (!credential) {
      this.credentialRepository.create(payload);
    }
  }

  async notifyUser(userId: string, notification: any, data: any = {}) {
    const devices =
      (await this.credentialRepository.find({
        where: { userId, key: "fcmPushNotificationToken" },
      })) || [];
    // console.log({ devices, userId, notification });
    // const tokens = devices?.map((device:any)=> device.value);
    // data = this.parseData(data);
    for (let device of devices) {
      try {
        const token = device.value;
        await this.sendPushNotification(token, notification, data);
        console.log("passou");
      } catch (ex) {
        try {
          await this.credentialRepository.deleteById(device.id);
          console.log(" n passou");
        } catch (ex) {
          console.log("falou cred");
        }
      }
    }
  }

  // Method to send a push notification
  async sendPushNotification(
    token: string,
    notification: any = { body: "", title: "" }, // admin.messaging.Message,
    data: any = {}
  ): Promise<void> {
    try {
      // @ts-ignore
      data = this.parseData(data);
      await admin.messaging().send({
        token: token,
        notification,
        data: data,
      });
      // await admin.messaging().send({
      //   token: token,
      //   notification: {
      //     title: "Portugal vs. Denmark",
      //     body: "great match!",
      //   },
      //   data: {
      //     Nick: "Mario",
      //     Room: "PortugalVSDenmark",
      //   },
      // });
      console.log("Successfully sent message.");
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
    data: any = {}
  ): Promise<void> {
    try {
      data = this.parseData(data)
      const response = await admin.messaging().sendEach(
        tokens.map((token) => {
          return {
            token,
            notification: notification?.notification || notification,
            data,
          };
        })
      );

      console.log(
        tokens,
        JSON.stringify(response),
        `${response} messages were sent successfully`
      );
      if (response.failureCount > 0) {
        console.log(`${response.failureCount} messages failed to send.`);
      }
    } catch (error) {
      console.error("Error sending multicast message:", error);
      throw error;
    }
  }

  private parseData(data: any = {}) {
    data = {
      action: data?.action || "NONE",
      payload: JSON.stringify(data.payload || {}),
    };

    return data;
  }
}
