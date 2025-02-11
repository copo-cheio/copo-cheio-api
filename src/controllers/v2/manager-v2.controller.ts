// Uncomment these imports to begin using these cool features!

import {AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {get, param, patch, post, requestBody, response} from '@loopback/rest';
import {UserProfile} from '@loopback/security';

import {MenuFullQuery} from '../../blueprints/menu.blueprint';
import {DevRepository} from '../../repositories';
import {AuthService, ManagerService} from '../../services';

// import {inject} from '@loopback/core';

export class ManagerV2Controller {
  constructor(
    @repository('DevRepository') public devRepository: DevRepository | any,
    @inject('services.AuthService')
    protected authService: AuthService,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private currentUser: UserProfile, // Inject the current user profile
    @inject('services.ManagerService')
    public managerService: ManagerService,
  ) {}

  @post('/v2/manager/balconies')
  @response(200, {
    description: 'Array of available models',
  })
  async updateStockStatus(
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.managerService.createBalcony(body);
  }

  @patch('/v2/manager/balconies/{id}')
  @response(204, {
    description: 'Balcony PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({})
    body: any,
  ): Promise<void> {
    await this.managerService.updateBalcony(id, body);
  }

  @get('/v2/manager/menus')
  @response(200, {
    description: 'Balcony PATCH success',
  })
  async getManagerMenus(): Promise<any> {
    try {
      const menus = await this.managerService.findMenus(MenuFullQuery);
      return menus || [];
    } catch (ex) {
      console.warn(ex);
      return [];
    }
  }
}
