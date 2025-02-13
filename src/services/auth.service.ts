import {injectable} from '@loopback/core';

import * as admin from 'firebase-admin';

@injectable()
export class AuthService {
  constructor() {}

  async loginWithIdToken(body: {
    provider: string;
    idToken: string;
  }): Promise<admin.auth.DecodedIdToken> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(body.idToken);

      return decodedToken;
    } catch (error) {
      console.error('Error verifying ID token:', error);
      throw error;
    }
  }

  // Method to verify Firebase ID token
  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      if (idToken.startsWith('Bearer '))
        idToken = idToken.replace('Bearer ', '');
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      return decodedToken;
    } catch (error) {
      console.error('Error verifying ID token:', error);
      throw error;
    }
  }
}
