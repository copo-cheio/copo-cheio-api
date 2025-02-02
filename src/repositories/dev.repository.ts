import {Getter, inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {BalconyFullQuery} from '../blueprints/balcony.blueprint';
import {PlaceQueryFull} from '../blueprints/place.blueprint';
import {PostgresSqlDataSource} from '../datasources';
import {Dev, DevRelations} from '../models';
import {BalconyRepository} from './balcony.repository';
import {BaseRepository} from './base.repository.base';
import {MenuRepository} from './menu.repository';
import {OrderRepository} from './order.repository';
import {PlaceRepository} from './place.repository';
import {UserRepository} from './user.repository';
const ACTIONS: any = {
  'sign-in': 'signIn',
};

export class DevRepository extends BaseRepository<
  Dev,
  typeof Dev.prototype.id,
  DevRelations
> {
  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('PlaceRepository')
    private getPlaceRepository: Getter<PlaceRepository>,
    @repository.getter('BalconyRepository')
    private getBalconyRepository: Getter<BalconyRepository>,
    @repository.getter('MenuRepository')
    private getMenuRepository: Getter<MenuRepository>,
    @repository.getter('OrderRepository')
    private getOrderRepository: Getter<OrderRepository>,
  ) {
    super(Dev, dataSource);

    //console.log('fbi', this.findByAction);
  }

  async getUserOrder(app: any, refId: string) {
    await this.findByAction(app, 'user-order', refId);
  }

  async createUserOrder(app: any, refId: string, data: {balconyId: string}) {
    const order = parseCreateOrder(data, refId);
    const record = await this.findOrCreateByAction(
      app,
      'user-order',
      refId,
      order,
    );
    const userOrders = await this.findOrCreateByAction(
      'user',
      'user-orders',
      refId,
      [],
    );
    const balconyOrders = await this.findOrCreateByAction(
      'staff',
      'balcony-orders',
      data.balconyId,
      [],
    );

    await this.updateById(balconyOrders.id, {
      ...balconyOrders,
      data: [...balconyOrders.data, record],
    });

    await this.updateById(userOrders.id, {
      ...userOrders,
      data: [...userOrders.data, record],
    });
    return record;
  }

  async updateOrder(app: any, refId: string, data: any) {
    /* const order = parseCreateOrder(data); */
    const balconyOrders = await this.findByAction(
      app,
      'balcony-orders',
      data.balconyId,
    );
    const balconyOrder = balconyOrders.filter((o: any) => o.id == refId)[0];
    const userOrders = await this.findByAction(
      'user',
      'user-orders',
      balconyOrder.user.id,
    );
    const userOrder = balconyOrders.filter((o: any) => o.id == refId)[0];

    return {balconyOrder, balconyOrders, userOrder, userOrders, data};
  }

  async checkIn(app: any, refId: any, data: any) {
    // Is signed up?
    const placeRepository = await this.getPlaceRepository();
    const balconyRepository = await this.getBalconyRepository();
    /*
    c
    const response: any = {};
    onst orderRepository = await this.getOrderRepository();
    const menuRepository = await this.getMenuRepository(); */
    if (app === 'staff') {
      const place = await placeRepository.findById(
        data.placeId,
        PlaceQueryFull,
      );
      const balcony = await balconyRepository.findById(
        data.balconyId,
        BalconyFullQuery,
      );
      const orders = await this.findOrCreateByAction(
        app,
        'balcony-orders',
        data.balconyId,
        [],
      );
      data = {...data, place, balcony, orders};
    } else {
      const place = await placeRepository.findById(
        data.placeId,
        PlaceQueryFull,
      );
      const balcony = await balconyRepository.findById(
        data.balconyId,
        BalconyFullQuery,
      );
      const orders = await this.findOrCreateByAction(
        app,
        'user-orders',
        refId,
        [],
      );
      const order = await this.findByAction(app, 'user-order', refId);
      data = {...data, place, balcony, orders, order};
    }
    return this.findOrCreateThenUpdateByAction(app, 'check-in', refId, data);
  }

  async checkOut(app: any, refId: any, data: any) {
    // Is signed up?
    const record = await this.findByAction(app, refId, 'check-in');
    if (record) {
      await this.deleteById(record.id);
    }
    return {success: true};
  }

  async signIn(app: any, refId: any, data: any) {
    // Is signed up?
    let record = await this.findOrCreateByAction(app, 'sign-up', refId, data);
    record = await this.findOrCreateThenUpdateByAction(
      app,
      'sign-in',
      refId,
      data,
    );

    return record;
  }

  async signOut(app: any, refId: any, data: any) {
    // Is signed up?
    const record = await this.findByAction(app, refId, 'sign-in');
    if (record) {
      await this.deleteById(record.id);
    }
    return {success: true};
  }

  public async findOrCreateByAction(
    app: any,
    action: any,
    refId: string,
    data: any,
  ) {
    let record: any = await this.findByAction(app, action, refId);
    if (!record) {
      record = await this.createByAction(app, action, refId, data);
      record = await this.findByAction(app, action, refId);
    }
    return record;
  }
  public async findOrCreateThenUpdateByAction(
    app: any,
    action: any,
    refId: string,
    data: any,
  ) {
    let record: any = await this.findOrCreateByAction(app, action, refId, data);
    await this.updateById(record.id, {
      app,
      refId,
      action,
      data,
    });
    record = await this.findByAction(app, action, refId);
    return record;
  }
  public async findByAction(app: any, action: any, refId: string) {
    const record: any = await this.findOne({
      where: {and: [{refId}, {app}, {action}]},
    });
    return record;
  }
  async createByAction(app: any, action: any, refId: string, data: any) {
    const payload = {
      app,
      action,
      refId,
      data,
    };

    const record: any = await this.create(payload);
    return record;
  }
}

function parseCreateOrder(data: any = {}, refId: string) {
  return {...data, user: {id: refId}};
}
