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
};

export class DevController {
  constructor(
    @repository(DevRepository) public devRepository: DevRepository | any,
  ) {}

  @get('/dev/{app}/{action}/{refId}')
  @response(200, {
    description: 'Array of available models',
  })
  async doDummyGetAction(
    @param.path.string('app') app: string,
    @param.path.string('action') action: string,
    @param.path.string('refId') refId: string,
  ): Promise<any> {
    return this.devRepository[ACTIONS[action]](app, action, refId);
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
    return this.devRepository[ACTIONS[action]](app, refId, data);
  }
}
