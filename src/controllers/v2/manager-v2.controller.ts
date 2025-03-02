// Uncomment these imports to begin using these cool features!

import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  del,
  get,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';

import {AuthService, ManagerService} from '../../services';

// import {inject} from '@loopback/core';

export class ManagerV2Controller {
  constructor(
    @inject('services.AuthService')
    protected authService: AuthService,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private currentUser: UserProfile, // Inject the current user profile
    @inject('services.ManagerService')
    public managerService: ManagerService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                    PAGES                                   */
  /* -------------------------------------------------------------------------- */
  @get('/v2/manager/home')
  @response(200, {
    description: 'Manager home page',
  })
  async getManagerHomePage(): Promise<any> {
    try {
      const homePage = await this.managerService.getHomePage();
      return homePage;
    } catch (ex) {
      console.warn(ex);
      return [];
    }
  }
  @get('/v2/manager/place/{id}')
  @response(200, {
    description: 'Manager home page',
  })
  async getManagerPlacePage(@param.path.string('id') id: string): Promise<any> {
    return this.managerService.getPlacePage(id);
  }

  /* -------------------------------------------------------------------------- */
  /*                                     GET                                    */
  /* -------------------------------------------------------------------------- */
  @get('/v2/manager/menus')
  @response(200, {
    description: 'Manager menus page',
  })
  async getManagerMenus(): Promise<any> {
    try {
      const menus = await this.managerService.findMenus();
      return menus || [];
    } catch (ex) {
      console.warn(ex);
      return [];
    }
  }
  @get('/v2/manager/orders')
  @response(200, {
    description: 'Manager orders page',
  })
  async getManagerOrders(): Promise<any> {
    try {
      const orders: any = await this.managerService.findOrders();
      return orders || [];
    } catch (ex) {
      console.warn(ex);
      return [];
    }
  }

  @get('/v2/manager/balconies/stocks')
  @response(200, {
    description: 'Manager balcony stocks page',
  })
  async getBalconiesWithStock() {
    return this.managerService.findBalconyStocks();
  }

  @get('/v2/manager/stocks')
  @response(200, {
    description: 'Manager stocks page',
  })
  async getStocksV2() {
    return this.managerService.getStocksPageV2();
  }
  @get('/v2/manager/stocks/{id}')
  @response(200, {
    description: 'Balcony stock page',
  })
  async getStockV2(@param.path.string('id') id: string) {
    return this.managerService.getStockPageV2(id);
  }

  @get('/v2/manager/schedule')
  @response(200, {
    description: 'Manager schedule page',
  })
  async getSchedule() {
    return this.managerService.getSchedulePage();
  }

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */

  @post('/v2/manager/products')
  @authenticate('firebase')
  @response(200, {
    description: 'Create product',
  })
  async createProduct(
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.managerService.createProduct(body);
  }
  @post('/v2/manager/balconies')
  @authenticate('firebase')
  @response(200, {
    description: 'Array of available models',
  })
  async createBalcony(
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.managerService.createBalcony(body);
  }
  @post('/v2/manager/place')
  @authenticate('firebase')
  @response(200, {
    description: 'Create a place',
  })
  async createPlace(
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.managerService.createPlace(body);
  }
  @post('/v2/manager/menu-products')
  @authenticate('firebase')
  @response(200, {
    description: 'Create a menu product',
  })
  async createMenuProduct(
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.managerService.createMenuProduct(body);
  }

  @post('/v2/manager/company')
  @authenticate('firebase')
  @response(200, {
    description: 'Create a company',
  })
  async createCompany(
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.managerService.createCompany(body);
  }

  /* -------------------------------------------------------------------------- */
  /*                                   UPDATE                                   */
  /* -------------------------------------------------------------------------- */

  @patch('/v2/manager/balconies/{id}')
  @authenticate('firebase')
  @response(204, {
    description: 'Balcony PATCH success',
  })
  async updateBalconyById(
    @param.path.string('id') id: string,
    @requestBody({})
    body: any,
  ): Promise<void> {
    await this.managerService.updateBalcony(id, body);
  }
  @patch('/v2/manager/places/{id}')
  @authenticate('firebase')
  @response(204, {
    description: 'Balcony PATCH success',
  })
  async updatePlaceById(
    @param.path.string('id') id: string,
    @requestBody({})
    body: any,
  ): Promise<any> {
    await this.managerService.updatePlaceV2(id, body);
  }

  @patch('/v2/manager/products/{id}')
  @authenticate('firebase')
  @response(200, {
    description: 'Array of available models',
  })
  async updateProductById(
    @param.path.string('id') id: string,
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.managerService.updateProductById(id, body);
  }

  @patch('/v2/manager/menu-products/{id}')
  @authenticate('firebase')
  @response(200, {
    description: 'Array of available models',
  })
  async updateMenuProduct(
    @param.path.string('id') id: string,
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.managerService.updateMenuProduct(id, body);
  }
  @patch('/v2/manager/company/{id}')
  @authenticate('firebase')
  @response(200, {
    description: 'Array of available models',
  })
  async updateCompany(
    @param.path.string('id') id: string,
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.managerService.updateCompany(id, body);
  }

  /* -------------------------------------------------------------------------- */
  /*                                    CLONE                                   */
  /* -------------------------------------------------------------------------- */

  /* -------------------------------------------------------------------------- */
  /*                                   DELETE                                   */
  /* -------------------------------------------------------------------------- */

  /* -------------------------------------------------------------------------- */
  /*                                    TEAM                                    */
  /* -------------------------------------------------------------------------- */

  @post('/v2/manager/team-staff')
  @authenticate('firebase')
  @response(200, {
    description: 'Team DELETE success',
  })
  async createorUpdateTeamStaff(
    @requestBody({})
    body: any,
  ): Promise<void> {
    return this.managerService.updateTeamStaff(
      body.teamId,
      body.staff.id,
      body.currentRoles,
      body.newRoles,
    );
  }

  @post('/v2/manager/remove/team-staff/')
  @authenticate('firebase')
  @response(200, {
    description: 'Team DELETE success',
  })
  async removeStaffFromTeam(
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.managerService.removeStaffFromTeam(body.teamId, body.staffIid);
  }

  @post('/v2/manager/teams')
  @authenticate('firebase')
  @response(200, {
    description: 'Team CREATE success',
  })
  async createTeam(
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.managerService.createTeam(body);
  }

  @patch('/v2/manager/teams/{id}')
  @authenticate('firebase')
  @response(204, {
    description: 'Balcony PATCH success',
  })
  async updateTeamById(
    @param.path.string('id') id: string,
    @requestBody({})
    body: any,
  ): Promise<void> {
    await this.managerService.updateTeam(id, body);
  }

  @get('/v2/manager/clone/teams/{id}')
  @authenticate('firebase')
  @response(204, {
    description: 'Team CLONE success',
  })
  async cloneTeamById(@param.path.string('id') id: string): Promise<void> {
    return this.managerService.cloneTeamById(id);
  }

  @del('/v2/manager/teams/{id}')
  @authenticate('firebase')
  @response(204, {
    description: 'Team DELETE success',
  })
  async deleteTeamById(@param.path.string('id') id: string): Promise<void> {
    return this.managerService.deleteTeam(id);
  }

  @del('/v2/manager/team/{teamId}/staff/{staffId}')
  @authenticate('firebase')
  @response(204, {
    description: 'Team DELETE success',
  })
  async deleteTeamStaffById(
    @param.path.string('teamId') teamId: string,
    @param.path.string('staffId') staffId: string,
  ): Promise<any> {
    return {teamId, staffId};
    //return this.managerService.deleteTeamStaffBy(id);
  }
}
