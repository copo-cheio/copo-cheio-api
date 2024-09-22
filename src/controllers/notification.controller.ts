// Uncomment these imports to begin using these cool features!


// import {inject} from '@loopback/core';

import {get,param,response} from '@loopback/rest';
// import {get} from 'http';

import {inject} from '@loopback/core';
import {PushNotificationService} from '../services/push-notification.service';

// import {inject} from '@loopback/core';

export class NotificationController {
  constructor(
    @inject('services.PushNotificationService')
    private pushNotificationService: PushNotificationService,
  ) {}


  @get('/test/single-notification/{token}')
  @response(200, {
    description: 'testing single token messaing',
    content: {
      'application/json': {
        schema: {}
      },
    },
  })
  async testNotification(
    @param.path.string('token') token: string,

  ): Promise<any> {
    // const {token, title, body} = body;
    const title = "test single notification";
    const body = "Body for the single notification";
    // Define notification payload
    // const payload: admin.messaging.Message = {
    const payload: any = {
      notification: {
        title: title,
        body: body,
      },
    };

    // Call Firebase service to send the push notification to a single device
    setTimeout(()=>{
      this.pushNotificationService.sendPushNotification(token, payload);
    },5000)
    return await this.pushNotificationService.sendPushNotification(token, payload);

  }


  // Send push notifications to multiple devices
  @get('/test/multicast-notification/{tokens}')
  @response(200, {
    description: 'testing single token messaing',
    content: {
      'application/json': {
        schema: {}
      },
    }})
  async sendMulticastNotification(
    @param.path.string('tokens') _tokens: string,
  ): Promise<void> {
    // const {tokens, title, body} = body;
    const title = "test multicast notification";
    const body = "Body for the multicast notification";
    const tokens = _tokens.replace(/[\[\]']+/g,"").split(',')
    console.log({tokens,isArray: Array.isArray(tokens),body})
    // Define notification payload
    const payload:any = { //} admin.messaging.MessagingPayload = {
      notification: {
        title: title,
        body: body,
      },
    };

    // Call Firebase service to send push notifications to multiple devices
    setTimeout(()=>{
      this.pushNotificationService.sendPushNotifications(Array.isArray(tokens) ? tokens:[tokens], payload);
    },5000)
    return await this.pushNotificationService.sendPushNotifications(Array.isArray(tokens) ? tokens:[tokens], payload);
  }
}
