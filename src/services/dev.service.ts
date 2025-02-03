import {
  /* inject, */ BindingScope,
  Getter,
  inject,
  injectable,
} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  BalconyRepository,
  DevRepository,
  MenuRepository,
  OrderRepository,
  PlaceRepository,
  UserRepository,
} from '../repositories';
import {DevServiceApi} from './dev/dev.api';
import {PushNotificationService} from './push-notification.service';

/*
 * Fix the service type. Possible options can be:
 * - import {Dev} from 'your-module';
 * - export type Dev = string;
 * - export interface Dev {}
 */
export type Dev = unknown;

@injectable({scope: BindingScope.TRANSIENT})
export class DevService {
  api: any;
  constructor(
    @repository.getter('DevRepository')
    public devRepositoryGetter: Getter<DevRepository>,
    @repository.getter('UserRepository')
    public userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('PlaceRepository')
    public getPlaceRepository: Getter<PlaceRepository>,
    @repository.getter('BalconyRepository')
    public getBalconyRepository: Getter<BalconyRepository>,
    @repository.getter('MenuRepository')
    public getMenuRepository: Getter<MenuRepository>,
    @repository.getter('OrderRepository')
    public getOrderRepository: Getter<OrderRepository>,
    @inject('services.PushNotificationService')
    public pushNotificationService: PushNotificationService,
  ) {
    this.api = new DevServiceApi();
    this.api.init(
      this,
      userRepositoryGetter,
      getPlaceRepository,
      getBalconyRepository,
      getMenuRepository,
      getOrderRepository,
      pushNotificationService,
    );
  }

  public async findOrCreateByAction(
    app: any,
    action: any,
    refId: string,
    data: any,
  ) {
    return await this.api.findOrCreateByAction(app, action, refId, data);
  }
  public async findOrCreateThenUpdateByAction(
    app: any,
    action: any,
    refId: string,
    data: any,
  ) {
    return await this.api.findOrCreateThenUpdateByAction(
      app,
      action,
      refId,
      data,
    );
  }
  public async findByAction(app: any, action: any, refId: string) {
    return await this.api.findByAction(app, action, refId);
  }
  async createByAction(app: any, action: any, refId: string, data: any) {
    return await this.api.createByAction(app, action, refId, data);
  }
  /* value() {
    // Add your implementation here
    throw new Error('To be implemented');
  } */
}
