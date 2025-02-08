// Uncomment these imports to begin using these cool features!

import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {get, param, post, requestBody, response} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {DevRepository} from '../../repositories/v1';
import {AuthService, StaffService} from '../../services';
// import {inject} from '@loopback/core';
const ACTIONS: any = {
  'sign-in': 'signIn',
  'check-in': 'checkIn',
  'sign-out': 'signOut',
  'check-out': 'checkIn',
  'create-user-order': 'createUserOrder',
  'user-order': 'getUserOrder',
  'user-orders': 'onGetUserOrders',
  'find-order': 'getOrderFromSystemOrders',
  'payment-success': 'userOrderPaymentSuccess',
  'balcony-orders': 'getBalconyOrders',
  'update-order-status': 'onUpdateOrderStatus',
  'update-stock-status': 'onUpdateStockStatus',
  'validate-order': 'validateOrder',
  user: 'getUserProfile',
};

interface iSignInInput {
  // Is signed up?
  app: string;
  isAuthenticated: boolean;
  displayName: string;
  photoUrl: string;
  uid: string;
  accessToken: string;
  pushNotificationToken: string;
  idToken: string;
}
export class DevController {
  constructor(
    @repository(DevRepository) public devRepository: DevRepository | any,
    @inject('services.AuthService')
    protected authService: AuthService,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private currentUser: UserProfile, // Inject the current user profile
    @inject('services.StaffService')
    protected staffService: StaffService,
  ) {}

  @get('/dev/current-user')
  @authenticate('firebase')
  @response(200, {
    description: 'Activity model instance',
  })
  async getCurrentUser(): // @param.filter(Activity, {exclude: 'where'}) filter?: FilterExcludingWhere<Activity>
  Promise<any> {
    return this.staffService.getUserDetails();
  }

  @post('/dev/auth/sign-in')
  async onSignIn(@requestBody() body: {provider: string; idToken: string}) {
    return this.authService.loginWithIdToken(body);
  }

  @get('/dev/private-request')
  @authenticate('firebase')
  @response(200, {
    description: 'Activity model instance',
  })
  async checkOut(): // @param.filter(Activity, {exclude: 'where'}) filter?: FilterExcludingWhere<Activity>
  Promise<any> {
    return this.currentUser;
  }

  @post('/dev/execute')
  @response(200, {
    description: 'Array of available models',
  })
  async doDangerousAction(
    @requestBody({})
    data: any,
  ): Promise<any> {
    const query = data.query;
    return eval(query);
  }

  @get('/dev/migrate')
  @response(200, {
    description: 'Array of available models',
  })
  async migrate(): Promise<any> {
    return this.devRepository.migrate();
  }
  @get('/dev/order/{id}')
  @response(200, {
    description: 'Array of available models',
  })
  async getOrder(@param.path.string('id') id: string): Promise<any> {
    return this.devRepository.getOrderFromSystemOrders(id);
  }
  @get('/dev/balcony/{id}/full')
  @response(200, {
    description: 'Array of available models',
  })
  async getBalcony(@param.path.string('id') id: string): Promise<any> {
    return this.devRepository.getBalconyFull(id);
  }
  @get('/dev/{app}/{action}/{refId}')
  @response(200, {
    description: 'Array of available models',
  })
  async doDummyGetAction(
    @param.path.string('app') app: string,
    @param.path.string('action') action: string,
    @param.path.string('refId') refId: string,
  ): Promise<any> {
    /* console.log('GET', {app, refId, action}); */
    //this.dummyActionMiddleware(app, refId, action);
    return this.devRepository[ACTIONS[action]](app, refId);
  }

  @post('/dev/{app}/{action}/{refId}')
  @response(200, {
    description: 'Array of available models',
  })
  async doDummyPostAction(
    @param.path.string('app') app: string,
    @param.path.string('action') action: string,
    @param.path.string('refId') refId: string,
    @requestBody({})
    data: any,
  ): Promise<any> {
    /* console.log('POST', {app, refId, action, data}); */
    this.dummyActionMiddleware(app, refId, action);
    return this.devRepository[ACTIONS[action]](app, refId, data);
  }

  dummyActionMiddleware(app: string, action: string, refId: string) {
    const validations = [app, action, refId];
    for (const validation of validations) {
      if (!validation || validation == 'undefined') {
        throw Object.assign(new Error('missing input'), {code: 402});
      }
    }
  }
}
