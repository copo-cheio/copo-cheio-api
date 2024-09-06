import {AuthenticationStrategy} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {HttpErrors,Request} from '@loopback/rest';
import {UserProfile,securityId} from '@loopback/security';
import {admin} from '../firebase-config';
import {UserRepository} from '../repositories';

export const FirebaseAuthHelper =  (()=>{
  const extractCredentials = (request:Request)=>{
    delete request.params.__auth__
     try{

       const authHeader = request.headers.authorization;
       if (!authHeader) return undefined;
       const parts = authHeader.split(' ');
       if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return undefined;
       return parts[1];
      }catch(ex){
        return undefined
      }
  }

  const getAuthenticatedUser = async (request:Request)=> {

    try{
      const token = extractCredentials(request);
      if (!token) {
        return undefined
      }

      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const userProfile: UserProfile = {
          [securityId]: decodedToken.uid,
          name: decodedToken.name,
          email: decodedToken.email,
          id: decodedToken.uid,
        };
        request.params.__auth__ = decodedToken.uid
        return userProfile.id;
      } catch (err) {
        console.log({err})
        return undefined
        // throw new HttpErrors.Unauthorized('Error verifying token.');
      }
    }catch(ex){
      return undefined
    }
  }
  return {getAuthenticatedUser}
})()
export class FirebaseAuthStrategy implements AuthenticationStrategy {
  name = 'firebase';

  constructor(  @repository(UserRepository)
  public UserRepository: UserRepository,){

  }

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    delete request.params.__auth__
    const token = this.extractCredentials(request);
    if (!token) {
      throw new HttpErrors.Unauthorized('Authorization header not found.');
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const user:any= await this.UserRepository.findOne({where:{firebaseUserId:decodedToken.uid}})

      const userProfile: UserProfile = {
        [securityId]: decodedToken.uid,
        name: decodedToken.name,
        email: decodedToken.email,
        id: user.id,
        uid: decodedToken.uid,
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
