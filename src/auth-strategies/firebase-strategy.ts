import {AuthenticationStrategy} from '@loopback/authentication';
import {HttpErrors,Request} from '@loopback/rest';
import {UserProfile,securityId} from '@loopback/security';
import {admin} from '../firebase-config';

export class FirebaseAuthStrategy implements AuthenticationStrategy {
  name = 'firebase';

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const token = this.extractCredentials(request);

    if (!token) {
      throw new HttpErrors.Unauthorized('Authorization header not found.');
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const userProfile: UserProfile = {
        [securityId]: decodedToken.uid,
        name: decodedToken.name,
        email: decodedToken.email,
        id: decodedToken.uid,
      };

      return userProfile;
    } catch (err) {
      console.log({err})
      throw new HttpErrors.Unauthorized('Error verifying token.');
    }
  }

  extractCredentials(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return undefined;
    return parts[1];
  }
}
