// Uncomment these imports to begin using these cool features!

import {get, param, post, requestBody, response} from '@loopback/rest';

// import {inject} from '@loopback/core';

export class DevController {
  constructor() {}

  @get('/dev/{app}/{action}/{refId}')
  @response(200, {
    description: 'Array of available models',
  })
  async doDummyGetAction(
    @param.path.string('app') app: string,
    @param.path.string('action') action: string,
    @param.path.string('refId') refId: string,
  ): Promise<any> {
    return new Promise(res => {
      setTimeout(() => {
        res({app, action, refId});
      }, 10);
    });
  }

  @post('/dev/{app}/{action}/{refId}')
  @response(200, {
    description: 'Array of available models',
  })
  async doDummyPostAction(
    @param.path.string('app') app: string,
    @param.path.string('action') action: string,
    @param.path.string('refId') refId: string,
    @requestBody({
      data: {},
    })
    data: any,
  ): Promise<any> {
    return new Promise(res => {
      setTimeout(() => {
        res({app, action, refId});
      }, 10);
    });
  }
}
