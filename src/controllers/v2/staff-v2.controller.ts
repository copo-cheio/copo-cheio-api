// Uncomment these imports to begin using these cool features!

import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {get, post, requestBody, response} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {DevRepository} from '../../repositories/v1';
import {AuthService, StaffService} from '../../services';
// import {inject} from '@loopback/core';

export class StaffV2Controller {
  constructor(
    @repository(DevRepository) public devRepository: DevRepository | any,
    @inject('services.AuthService')
    protected authService: AuthService,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private currentUser: UserProfile, // Inject the current user profile
    @inject('services.StaffService')
    protected staffService: StaffService,
  ) {}

  @get('/v2/staff/info')
  @authenticate('firebase')
  @response(200, {
    description: 'Activity model instance',
  })
  async getCurrentUser(): // @param.filter(Activity, {exclude: 'where'}) filter?: FilterExcludingWhere<Activity>
  Promise<any> {
    return this.staffService.getActiveStaffInfo();
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
}
