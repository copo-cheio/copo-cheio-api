// Uncomment these imports to begin using these cool features!

import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {get, param, post, requestBody, response} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {DevRepository} from '../../repositories';
import {AuthService, StaffService} from '../../services';
// import {inject} from '@loopback/core';

export class StaffV2Controller {
  constructor(
    @repository('DevRepository') public devRepository: DevRepository | any,
    @inject('services.AuthService')
    protected authService: AuthService,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private currentUser: UserProfile, // Inject the current user profile
    @inject('services.StaffService')
    protected staffService: StaffService,
  ) {}

  @get('/v2/staff/page/activity/places')
  @authenticate('firebase')
  @response(200, {
    description: 'Artist model instance',
    content: {},
  })
  async getPageActivityPlaces(): Promise<any> {
    return this.staffService.getPageActivityPlaces();
  }
  @get('/v2/staff/page/activity/events')
  @authenticate('firebase')
  @response(200, {
    description: 'Artist model instance',
    content: {},
  })
  async getPageActivityEvents(): Promise<any> {
    return this.staffService.getPageActivityEvents();
  }

  @get('/v2/staff/orders-page')
  @authenticate('firebase')
  @response(200, {
    description: 'Activity model instance',
  })
  async getOrdersPage(): // @param.filter(Activity, {exclude: 'where'}) filter?: FilterExcludingWhere<Activity>
  Promise<any> {
    return this.staffService.getStaffOrdersPage();
  }
  @get('/v2/staff/order-page/{id}')
  @authenticate('firebase')
  @response(200, {
    description: 'Activity model instance',
  })
  async getOrderPage(@param.path.string('id') id: string): Promise<any> {
    return this.staffService.getStaffOrderPage(id);
  }

  @get('/v2/staff/balcony-orders')
  @authenticate('firebase')
  @response(200, {
    description: 'Activity model instance',
  })
  async getBalconyOrders(): // @param.filter(Activity, {exclude: 'where'}) filter?: FilterExcludingWhere<Activity>
  Promise<any> {
    return this.staffService.getBalconyOrders();
  }

  @get('/v2/staff/info')
  @authenticate('firebase')
  @response(200, {
    description: 'Activity model instance',
  })
  async getCurrentUser(): // @param.filter(Activity, {exclude: 'where'}) filter?: FilterExcludingWhere<Activity>
  Promise<any> {
    return this.staffService.getActiveStaffInfo();
  }

  @post('/v2/staff/validate-order')
  @authenticate('firebase')
  @response(200, {
    description: 'Array of available models',
  })
  async validateOrderV2(
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.staffService.validateOrderV2(body);
  }
  @post('/v2/staff/update-stock-status')
  @authenticate('firebase')
  @response(200, {
    description: 'Array of available models',
  })
  async updateStockStatus(
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.staffService.updateStockStatus(body.stockId, body.status);
  }
  @post('/v2/staff/update-order-status')
  @authenticate('firebase')
  @response(200, {
    description: 'Array of available models',
  })
  async updateOrderStatus(
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.staffService.updateOrderStatus(body);
  }
}
