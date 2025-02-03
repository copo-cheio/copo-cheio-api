import {Getter, inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {Dev, DevRelations} from '../models';
import {PushNotificationService} from '../services/push-notification.service';
import {BalconyRepository} from './balcony.repository';
import {BaseRepository} from './base.repository.base';
import {MenuRepository} from './menu.repository';
import {OrderRepository} from './order.repository';
import {PlaceRepository} from './place.repository';
import {UserRepository} from './user.repository';

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
    @inject('services.PushNotificationService')
    private pushNotificationService: PushNotificationService,
  ) {
    super(Dev, dataSource);

    //console.log('fbi', this.findByAction);
  }

  async getUserOrder(app: any, refId: string, extraParam?: string) {
    if (extraParam) refId = extraParam;
    return this.findByAction(app, 'user-order', refId);
  }
  async userOrderPaymentSuccess(app: string, refId: string, data: any = {}) {
    let record: any = await this.getUserOrder(app, refId);
    const action = 'user-order';
    const newData = Object.assign(
      {},
      {
        ...record.data,
        status: 'ONHOLD',
        active: true,
        order: {
          ...record.data.order,
          order: {
            ...record.data.order.order,
            timeline: [createTimeline(record.data.id, 'ONHOLD')],
          },
        },
      },
    );

    await this.updateById(record.id, {
      app,
      refId,
      action,
      data: newData,
    });
    record = await this.findByAction(app, action, refId);
    const userOrders = await this.findByAction(app, 'user-orders', refId);
    await this.updateById(userOrders.id, {
      ...userOrders,
      data: userOrders.data.map((o: any) => {
        if (o.id == record.data.id) {
          o = record.data;
        }
        return o;
      }),
    });
    const balconyOrders = await this.findByAction(
      'staff',
      'balcony-orders',
      record.data.balconyId,
    );
    await this.updateById(balconyOrders.id, {
      ...balconyOrders,
      data: balconyOrders.data.map((o: any) => {
        if (o.id == record.data.id) {
          o = record.data;
        }
        return o;
      }),
    });

    const title = 'test multicast notification';
    const body = 'Body for the multicast notification';
    // const tokens = _tokens.replace(/[\[\]']+/g, "").split(",");
    // console.log({ tokens, isArray: Array.isArray(tokens), body });
    // Define notification payload
    // const payload: any = {
    //   //} admin.messaging.MessagingPayload = {
    //   notification: {
    //     title: title,
    //     body: body,
    //   },
    // };

    /*    const notifyUser = ()=>{

      // Call Firebase service to send push notifications to multiple devices
      const {notification, data} = JSON.parse(payload);
      return this.pushNotificationService.sendPushNotification(
        token,
        notification || {title, body},
        data || {},
      );
    } */
    return record;
  }
  async createUserOrder(app: string, refId: string, data: any = {}) {
    const order = data;

    let record: any = await this.getUserOrder(app, refId);
    if (record?.id) {
      await this.deleteByIdHard(record.id);
    }

    record = await this.findOrCreateByAction(app, 'user-order', refId, order);

    record = await this.findOrCreateThenUpdateByAction(
      app,
      'user-order',
      refId,
      Object.assign(
        {},
        {
          ...record.data,
          id: record.id,
          order: {...record.data.order, id: record.id},
        },
      ),
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

    if (app === 'staff') {
      const orders = await this.findOrCreateByAction(
        app,
        'balcony-orders',
        data.balconyId,
        [],
      );
      data = {...data, orders};
    } else {
      const orders = await this.findOrCreateByAction(
        app,
        'user-orders',
        refId,
        [],
      );
      const order = await this.findByAction(app, 'user-order', refId);
      data = {...data, orders, order};
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

function createTimeline(
  orderId: string,
  status: string,
  staffId: string = 'e5ed35ae-f951-4a70-a129-e298a92c07cc',
) {
  return {
    id: '12ab87d2-73ff-4a79-872c-89390b4cde84',
    created_at: '2024-11-12T19:25:34.975Z',
    updated_at: '2024-11-12T19:25:34.975Z',
    orderId: orderId,
    action: status,
    title: status,
    staffId: staffId,
    timelineKey: status,
    staff: {
      deleted: false,
      deletedOn: null,
      deletedBy: null,
      id: staffId,
      created_at: '2024-09-30T04:30:23.982Z',
      updated_at: '2024-09-30T04:30:23.982Z',
      name: 'Filipe',
      avatar:
        'https://lh3.googleusercontent.com/a/ACg8ocI-GCGkmacL9DIKSmik1s-asg3Tib0F62HU4s0VfbmmgFwA9g=s96-c',
      email: 'pihh.backup@gmail.com',
      firebaseUserId: 'IrU8vmqxK8R9qcp1EP2Yl4Ddvx92',
      latitude: '38.5061208',
      longitude: '-9.1559578',
      isDeleted: false,
    },
  };
}
