// Uncomment these imports to begin using these cool features!

import {repository} from '@loopback/repository';
import {get, param, post, requestBody, response} from '@loopback/rest';
import {DevRepository} from '../repositories';

// import {inject} from '@loopback/core';
const ACTIONS: any = {
  'sign-in': 'signIn',
  'check-in': 'checkIn',
  'sign-out': 'signOut',
  'check-out': 'checkIn',
  'create-user-order': 'createUserOrder',
  'user-order': 'getUserOrder',
  'find-order': 'getOrderFromSystemOrders',
  'payment-success': 'userOrderPaymentSuccess',
  'balcony-orders': 'getBalconyOrders',
  'update-order-status': 'onUpdateOrderStatus',
};

export class DevController {
  constructor(
    @repository(DevRepository) public devRepository: DevRepository | any,
  ) {}

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

  @get('/dev/order/{id}')
  @response(200, {
    description: 'Array of available models',
  })
  async getOrder(@param.path.string('id') id: string): Promise<any> {
    return this.devRepository.getOrderFromSystemOrders(id);
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
    console.log('GET', {app, refId, action});
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
    console.log('POST', {app, refId, action, data});
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
