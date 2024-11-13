import {inject,Interceptor,InvocationContext,InvocationResult,Next,Provider} from '@loopback/core';
import {RestBindings} from '@loopback/rest';
import {Request} from 'express-serve-static-core';
import * as admin from 'firebase-admin';
import {FirebaseAuthHelper} from '../auth-strategies/firebase-strategy';
import {serviceAccount} from '../firebase-config';
import {AuthService} from '../services';
import {UserService} from '../services/user.service';


export class FirebaseAdminProvider implements Provider<admin.app.App> {
  value(): admin.app.App {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}


export class AclInterceptor implements Provider<Interceptor> {
  constructor(
    @inject(RestBindings.Http.REQUEST) private request: Request,

    @inject("services.UserService")
    protected userService: UserService,
    @inject("services.AuthService")
    protected authService: AuthService,

  ) {}

  value(): Interceptor {
    return this.intercept.bind(this);
  }


  async intercept(
    invocationCtx: InvocationContext,
    next: Next,
  ): Promise<InvocationResult> {
    // Pre-processing logic

    const request:any = invocationCtx.getSync('rest.http.request')
    const authHeader = request.headers['authorization'];

    const firebaseUserId:any = await FirebaseAuthHelper.getAuthenticatedUser(request)
    let user:any = {
      id:"6e6fcbef-886c-486e-8e15-f4ac5e234b5c"
    }
    if(firebaseUserId){
      user = await this.userService.getUserByFirebaseUserId(firebaseUserId)
    }


    const userAccess:any = await this.userService.getFullUserAccess(user.id)
    userAccess.user = {id:user.id}

    if(typeof invocationCtx.args[0] == "object") {

      invocationCtx.args[0].__userAccess= userAccess
    } else{
      invocationCtx.args.push({__userAccess:userAccess})
    }
    const result = await next(); // Proceed with the next step in the request lifecycle

    // Post-processing logic
    console.log('Method execution complete.');

    return result;
  }
}
