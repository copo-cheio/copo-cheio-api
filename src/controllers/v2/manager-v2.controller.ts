// Uncomment these imports to begin using these cool features!

import {AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {get, param, patch, post, requestBody, response} from '@loopback/rest';
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
    description: 'Balcony PATCH success',
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

  /* -------------------------------------------------------------------------- */
  /*                                     GET                                    */
  /* -------------------------------------------------------------------------- */
  @get('/v2/manager/menus')
  @response(200, {
    description: 'Manager menu list',
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
    description: 'Manager menu list',
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
    description: 'Array of available models',
  })
  async getBalconiesWithStock() {
    return this.managerService.findBalconyStocks();
  }
  /*   @get('/v2/manager/stocks')
  @response(200, {
    description: 'Array of available models',
  })
  async getStocks() {
    return this.managerService.getStocksPage();
  } */
  @get('/v2/manager/stocks')
  @response(200, {
    description: 'Array of available models',
  })
  async getStocksV2() {
    return this.managerService.getStocksPageV2();
  }

  @get('/v2/manager/schedule')
  @response(200, {
    description: 'Array of available models',
  })
  async getSchedule() {
    return this.managerService.getSchedulePage();
  }

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */

  @post('/v2/manager/products')
  @response(200, {
    description: 'Array of available models',
  })
  async createProduct(
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.managerService.createProduct(body);
  }
  @post('/v2/manager/balconies')
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
  @response(200, {
    description: 'Array of available models',
  })
  async createPlace(
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.managerService.createPlace(body);
  }
  @post('/v2/manager/menu-products')
  @response(200, {
    description: 'Array of available models',
  })
  async createMenuProduct(
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.managerService.createMenuProduct(body);
  }

  @post('/v2/manager/company')
  @response(200, {
    description: 'Array of available models',
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

  @patch('/v2/manager/products/{id}')
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
}
