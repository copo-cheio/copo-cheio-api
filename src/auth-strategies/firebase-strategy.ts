import {AuthenticationStrategy} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile, securityId} from '@loopback/security';
import {admin} from '../firebase-config';
import {UserRepository} from '../repositories/v1';

export const FirebaseAuthHelper = (() => {
  const extractCredentials = (request: Request) => {
    delete request.params.__auth__;
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader) return undefined;
      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer')
        return undefined;

      return parts[1];
    } catch (ex) {
      console.log({ex: ex.message});
      return undefined;
    }
  };

  const getAuthenticatedUser = async (request: Request, full?: boolean) => {
    try {
      const token = extractCredentials(request);
      if (!token) {
        return undefined;
      }

      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const userProfile: UserProfile = {
          [securityId]: decodedToken.uid,
          name: decodedToken.name,
          email: decodedToken.email,
          id: decodedToken.uid,
        };
        request.params.__auth__ = decodedToken.uid;

        return userProfile.id;
      } catch (err) {
        console.log({err: err.message});
        //return undefined
        throw new HttpErrors.Unauthorized('Error verifying token.');
      }
    } catch (ex) {
      console.log({err: ex.message});
      return undefined;
    }
  };
  return {getAuthenticatedUser};
})();
export class FirebaseAuthStrategy implements AuthenticationStrategy {
  name = 'firebase';

  constructor(
    @repository(UserRepository)
    public UserRepository: UserRepository,
  ) {}

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    delete request.params.__auth__;
    const token = this.extractCredentials(request);
    if (!token) {
      throw new HttpErrors.Unauthorized('Authorization header not found.');
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const user: any = await this.UserRepository.findOne({
        where: {firebaseUserId: decodedToken.uid},
      });

      const userProfile: UserProfile = {
        [securityId]: decodedToken.uid,
        name: decodedToken.name,
        email: decodedToken.email,
        id: user.id,
        uid: decodedToken.uid,
      };

      return userProfile;
    } catch (err) {
      // console.log({err})

      console.log(err.errorInfo);
      throw new HttpErrors.Unauthorized('Error verifying token.');
    }
  }

  extractCredentials(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer')
      return undefined;
    return parts[1];
  }

  async getCurrentUserId(request: Request): Promise<string | undefined> {
    const params: any = {
      params: request.params || {},
      headers: request.headers || {},
    };
    const token = this.extractCredentials(request);
    if (!token) {
      return undefined;
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const user: any = await this.UserRepository.findOne({
        where: {firebaseUserId: decodedToken.uid},
      });

      return user.id;
    } catch (err) {
      console.log(err.errorInfo);
      throw new HttpErrors.Unauthorized('Error verifying token.');
    }
  }
}
