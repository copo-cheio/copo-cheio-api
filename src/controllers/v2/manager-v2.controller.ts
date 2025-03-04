// Uncomment these imports to begin using these cool features!

import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject, intercept} from '@loopback/core';
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
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
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

  @get('/v2/manager/onboard')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
  @response(200, {
    description: 'Check if user is already logged',
  })
  async onBoardPage(): Promise<any> {
    return this.managerService.getOnboardingPage();
  }
  /* -------------------------------------------------------------------------- */
  /*                                   EVENTS                                   */
  /* -------------------------------------------------------------------------- */
  @get('/v2/manager/event/{id}')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
  @response(200, {
    description: 'Manager event page',
  })
  async getManagerEventPage(@param.path.string('id') id: string): Promise<any> {
    return this.managerService.getEventPage(id);
  }
  @get('v2/manager/event-instances/{id}')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
  @response(200, {
    description: 'Manager event page',
  })
  async getManagerEventInstancePage(
    @param.path.string('id') id: string,
  ): Promise<any> {
    return this.managerService.getEventInstancePage(id);
  }
  @get('/v2/manager/events')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
  @response(200, {
    description: 'Manager event page',
  })
  async getManagerEventsPage(): Promise<any> {
    return this.managerService.getEventsPage();
  }

  @post('/v2/manager/events')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
  @response(200, {
    description: 'Create a place',
  })
  async createEvent(
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.managerService.createEvent(body);
  }

  @patch('/v2/manager/events/{id}')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
  @response(204, {
    description: 'Balcony PATCH success',
  })
  async updateEventById(
    @param.path.string('id') id: string,
    @requestBody({})
    body: any,
  ): Promise<any> {
    await this.managerService.updateEventV2(id, body);
  }

  /* -------------------------------------------------------------------------- */
  /*                                    STAFF                                   */
  /* -------------------------------------------------------------------------- */
  @get('/v2/manager/staff')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
  @response(200, {
    description: 'Manager staff page',
  })
  async getCompanyStaff(): Promise<any> {
    try {
      const menus = await this.managerService.getCompanyStaff();
      return menus || [];
    } catch (ex) {
      console.warn(ex);
      return [];
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                     GET                                    */
  /* -------------------------------------------------------------------------- */
  @get('/v2/manager/menus')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
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
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
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
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
  @response(200, {
    description: 'Manager balcony stocks page',
  })
  async getBalconiesWithStock() {
    return this.managerService.findBalconyStocks();
  }

  @get('/v2/manager/stocks')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
  @response(200, {
    description: 'Manager stocks page',
  })
  async getStocksV2() {
    return this.managerService.getStocksPageV2();
  }
  @get('/v2/manager/stocks/{id}')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
  @response(200, {
    description: 'Balcony stock page',
  })
  async getStockV2(@param.path.string('id') id: string) {
    return this.managerService.getStockPageV2(id);
  }

  @get('/v2/manager/schedule')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
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
  @intercept('interceptors.CompanyOwnershipValidation')
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
  @intercept('interceptors.CompanyOwnershipValidation')
  @response(200, {
    description: 'Array of available models',
  })
  async createBalcony(
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.managerService.createBalcony(body);
  }

  /* -------------------------------------------------------------------------- */
  /*                                    PLACE                                   */
  /* -------------------------------------------------------------------------- */

  @get('/v2/manager/place/{id}')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
  @response(200, {
    description: 'Manager home page',
  })
  async getManagerPlacePage(@param.path.string('id') id: string): Promise<any> {
    return this.managerService.getPlacePage(id);
  }
  @get('v2/manager/place-instances/{id}')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
  @response(200, {
    description: 'Manager event page',
  })
  async getManagerPlaceInstancePage(
    @param.path.string('id') id: string,
  ): Promise<any> {
    return this.managerService.getPlaceInstancePage(id);
  }

  @get('/v2/manager/places')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
  @response(200, {
    description: 'Manager home page',
  })
  async getManagerPlacesPage(): Promise<any> {
    return this.managerService.getPlacesPage();
  }

  @post('/v2/manager/places')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
  @response(200, {
    description: 'Create a place',
  })
  async createPlace(
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.managerService.createPlace(body);
  }

  @patch('/v2/manager/places/{id}')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
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

  /* -------------------------------------------------------------------------- */
  /*                                    MENU                                    */
  /* -------------------------------------------------------------------------- */

  @post('/v2/manager/menu-products')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
  @response(200, {
    description: 'Create a menu product',
  })
  async createMenuProduct(
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.managerService.createMenuProduct(body);
  }

  /* -------------------------------------------------------------------------- */
  /*                                  PRODUCTS                                  */
  /* -------------------------------------------------------------------------- */
  @get('/v2/manager/products')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
  @response(200, {
    description: 'Array of available models',
  })
  async getProductsPage(): Promise<any> {
    return this.managerService.getProductsPage();
  }

  @patch('/v2/manager/products/{id}')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
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

  /* -------------------------------------------------------------------------- */
  /*                                   UPDATE                                   */
  /* -------------------------------------------------------------------------- */

  @patch('/v2/manager/balconies/{id}')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
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

  @patch('/v2/manager/menu-products/{id}')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
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

  /* -------------------------------------------------------------------------- */
  /*                                   COMPANY                                  */
  /* -------------------------------------------------------------------------- */
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

  @patch('/v2/manager/company/{id}')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
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
  @get('/v2/manager/teams')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
  @response(200, {
    description: 'Manager home page',
  })
  async getManagerTeams(): Promise<any> {
    return this.managerService.getTeamsPage();
  }
  @get('/v2/manager/teams/{id}')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
  @response(200, {
    description: 'Manager home page',
  })
  async getManagerTeam(@param.path.string('id') id: string): Promise<any> {
    return this.managerService.getTeamPage(id);
  }
  @post('/v2/manager/team-staff')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
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
  @intercept('interceptors.CompanyOwnershipValidation')
  @response(200, {
    description: 'Team DELETE success',
  })
  async removeStaffFromTeam(
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.managerService.removeStaffFromTeam(body.teamId, body.staffId);
  }

  @post('/v2/manager/teams')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
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
  @intercept('interceptors.CompanyOwnershipValidation')
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
  @intercept('interceptors.CompanyOwnershipValidation')
  @response(204, {
    description: 'Team CLONE success',
  })
  async cloneTeamById(@param.path.string('id') id: string): Promise<void> {
    return this.managerService.cloneTeamById(id);
  }

  @del('/v2/manager/teams/{id}')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
  @response(204, {
    description: 'Team DELETE success',
  })
  async deleteTeamById(@param.path.string('id') id: string): Promise<void> {
    return this.managerService.deleteTeam(id);
  }

  @del('/v2/manager/team/{teamId}/staff/{staffId}')
  @authenticate('firebase')
  @intercept('interceptors.CompanyOwnershipValidation')
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
