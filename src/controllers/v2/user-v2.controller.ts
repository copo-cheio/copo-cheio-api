// Uncomment these imports to begin using these cool features!

import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {get, param, post, requestBody, response} from '@loopback/rest';
import {UserProfile} from '@loopback/security';

import {DevRepository} from '../../repositories';
import {AuthService, OrderService} from '../../services';
import {UserService} from '../../services/user.service';

// import {inject} from '@loopback/core';

export class UserV2Controller {
  constructor(
    @repository('DevRepository') public devRepository: DevRepository | any,
    @inject('services.AuthService')
    protected authService: AuthService,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private currentUser: UserProfile, // Inject the current user profile
    @inject('services.UserService')
    protected userService: UserService,
    @inject('services.OrderService')
    protected orderService: OrderService,
  ) {}

  @post('/v2/user/create-order')
  @authenticate('firebase')
  @response(200, {
    description: 'Array of available models',
  })
  async createOrder(
    @requestBody({})
    body: any,
  ): Promise<any> {
    //this.orderService.createOrderV2(body);
    return this.devRepository.createUserOrder(
      'user',
      this.currentUser.uid,
      body,
    );
  }
  @post('/v2/user/create-order-2')
  @authenticate('firebase')
  @response(200, {
    description: 'Array of available models',
  })
  async createOrder2(
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.orderService.createOrderV2(body);
  }

  @post('/v2/user/order-payment-complete')
  @authenticate('firebase')
  @response(200, {
    description: 'Array of available models',
  })
  async onOrderPaymentComplete(
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.orderService.onOrderPaymentCompleteV2(body);
  }

  @get('/v2/user/order/{id}')
  @response(200, {
    description: 'Artist model instance',
    content: {},
  })
  async findById(@param.path.string('id') id: string): Promise<any> {
    return this.orderService.findByOrderByIdV2(id);
  }

  @post('/v2/user/update-push-token')
  @authenticate('firebase')
  @response(200, {
    description: 'Array of available models',
  })
  async updatePushNotificationToken(
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.userService.updatePushNotificationToken(body.token);
  }
}
