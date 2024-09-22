import {injectable} from '@loopback/core';

// @injectable({scope: BindingScope.TRANSIENT})
// export class AuthService {
//   constructor(/* Add @inject to inject parameters */) {}

//   /*
//    * Add service methods here
//    */
// }


import * as admin from 'firebase-admin';



@injectable()
export class AuthService {
  constructor() {
    // const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');

    // if (admin.apps.length === 0) {
    //   admin.initializeApp({
    //     credential: admin.credential.cert(serviceAccountPath),
    //   });
    // }
  }

  // Method to verify Firebase ID token
  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      console.error('Error verifying ID token:', error);
      throw error;
    }
  }
}
