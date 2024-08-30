// src/services/notification.service.ts

import {admin} from '../firebase-config';





export async function sendNotification(token: string, payload: any) {
  try {
    const response = await admin.messaging().sendToDevice(token, payload);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}
