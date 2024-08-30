// Uncomment these imports to begin using these cool features!

import {sendNotification} from "../utils/notifications";

// import {inject} from '@loopback/core';

export class NotificationController {
  constructor() {}

  async triggerNotification(token: string) {
    const payload = {
      notification: {
        title: "New Notification",
        body: "You have a new message!",
      },
    };
    await sendNotification(token, payload);
  }
}
