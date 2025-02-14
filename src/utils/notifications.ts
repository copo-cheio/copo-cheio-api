// src/services/notification.service.ts

import {admin} from '../firebase-config';

export async function sendNotification(token: string, payload: any) {
  try {
    const messaging: any = admin.messaging();
    const response = await messaging.sendToDevice(token, payload);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}
