import {Getter, inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {Dev, DevRelations} from '../models';
import {createTimeline} from '../services/dev/dev.utils';
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
    try {
      this.init();
    } catch (ex) {
      console.log(ex);
    }
    //console.log('fbi', this.findByAction);
  }

  async onUpdateOrderStatus(app: string, refId: string, data: any = {}) {
    const order = await this.getOrderFromSystemOrders(refId);

    return {order, data};
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
          orderId: record.id,
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

    await this.createNewOrder(data.placeId, data.balconyId, record.id, refId);
    return record;
  }

  async updateOrder(app: any, refId: string, data: any) {
    const order = await this.getOrder(refId);
    const user = await this.getUser(order.userId);
    const status = data.status;
    const staff = await this.getStaff(data.staffId);
    const balconyStaff = await this.getBalconyStaff(order.balconyId);
    const payload = {
      action: 'ORDER_UPDATE',
      payload: {
        id: refId,
        status: status,
        balcony: {
          id: order.balconyId,
          name: 'Test place balcony #1',
        },
        place: {
          id: order.placeId,
          name: 'Test place',
        },
      },
    };
    const staffPayload = Object.assign({}, payload);
    staffPayload.action = 'ORDER_RECIEVED';

    await this.notify(
      'user update',
      'user order updated',
      user.pushNotificationToken,
      payload,
    );
    await this.notify(
      'staff update',
      'staff order updated',
      staff.pushNotificationToken,
      staffPayload,
    );
    return {order, user, status, staff, balconyStaff};

    /* const balconyOrder = balconyOrders.filter((o: any) => o.id == refId)[0];
    const userOrders = await this.findByAction(
      'user',
      'user-orders',
      balconyOrder.user.id,
    );
    const userOrder = balconyOrders.filter((o: any) => o.id == refId)[0];

    return {balconyOrder, balconyOrders, userOrder, userOrders, data}; */
  }

  async notify(title, body, token, payloadData) {
    //const title = 'test single notification';
    //const body = 'Body for the single notification';
    // Define notification payload
    // const payload: admin.messaging.Message = {

    // const payload: any = {
    const notification = {
      title: title,
      body: body,
    };

    return this.pushNotificationService.sendPushNotification(
      token,
      notification,
      payloadData,
    );
  }

  async checkIn(app: any, refId: any, data: any) {
    // Is signed up?

    data.active = true;

    if (app === 'staff') {
      await this.findOrCreateByAction(
        app,
        'balcony-orders',
        data.balconyId,
        [],
      );
    } else {
      await this.findOrCreateByAction(app, 'user-orders', refId, []);
      const order = await this.findByAction(app, 'user-order', refId);
      data = {...data, order};
    }
    return this.findOrCreateThenUpdateByAction(app, 'check-in', refId, data);
  }

  async checkOut(app: any, refId: any, data: any) {
    // Is signed up?

    const record = await this.findByAction(app, refId, 'check-in');
    await this.updateById(record.id, {
      ...record,
      data: {...record.data, active: false},
    });
    return {success: true};
  }

  async signIn(app: any, refId: any, data: any) {
    // Is signed up?

    data.active = true;
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
      await this.updateById(record.id, {
        ...record,
        data: {...record.data, active: false},
      });
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

  async getUserOrder(app: any, refId: string, extraParam?: string) {
    if (extraParam) refId = extraParam;
    return this.findByAction(app, 'user-order', refId);
  }

  async getUserOrders(refId: string) {
    return this.findOrCreateByAction('user', 'user-orders', refId, []);
  }
  async getBalconyOrders(balconyId: string, a?: any, b?: any) {
    const app = 'staff';
    const action = 'balcony-orders';
    balconyId = b ? b : balconyId;

    return this.findOrCreateByAction(app, action, balconyId, []);
  }

  async createNewOrder(
    placeId: string,
    balconyId: string,
    orderId: string,
    userId: string,
  ) {
    const orders = await this.findById(this.systemOrdersId);
    const order = {placeId, balconyId, orderId, userId};
    await this.updateById(orders.id, {
      ...orders,
      data: [...orders.data, order],
    });
  }

  /**
   *
   * @param app
   * @param uid
   * @returns
   * {
  "id": "2f6fe1ac-913d-4984-8da9-c6721f9ca238",
  "uid": "o7KsXv5p00dVSbSQZJY5MWmLLky1",
  "displayName": "Filipe Sá",
  "photoUrl": "https://lh3.googleusercontent.com/a/ACg8ocLmDH7RUnhFFlwB5GPsV9WdSaJXdfP50-kuVk1bvH4bJwfuPjY=s96-c",
  "pushNotificationToken": "dF2RNqqvzh_X9_eJAByd8I:APA91bFuOyIV4mnSi9u6YQ6nnFNPH12YZwGIRM9MP02kHQbCBk7XMaSKNba2iNjuQi4aWUhW9_zmofqebCI5ugukOR5gR45QlhOQ0lCZULSARD6GRCDzB7I"
}
   */
  async getMembers(app, uids) {
    const records = await this.findAll({
      where: {app: app, refId: {inq: uids}, action: 'sign-in'},
    });
    return records.map(record => {
      return {
        id: record.id,
        uid: record.refId,
        displayName: record.data.displayName,
        photoUrl: record.data.photoUrl,
        pushNotificationToken: record.data.pushNotificationToken,
      };
    });
  }
  async getMember(app, uid) {
    const record = await this.findOne({
      where: {app: app, refId: uid, action: 'sign-in'},
    });
    const user = {
      id: record.id,
      uid: record.refId,
      displayName: record.data.displayName,
      photoUrl: record.data.photoUrl,
      pushNotificationToken: record.data.pushNotificationToken,
    };
    return user;
  }
  async getUser(uid) {
    return this.getMember('user', uid);
  }
  async getStaff(uid) {
    return this.getMember('staff', uid);
  }

  async getBalconyStaff(balconyId) {
    const allStaff = await this.findAll({
      where: {app: 'staff', action: 'check-in'},
    });
    const activeStaff = allStaff.filter(
      staff => staff.data.active && staff.data.balconyId == balconyId,
    );
    const currentStaff = await this.getMembers(
      'staff',
      activeStaff.map(s => s.refId),
    );
    return currentStaff;
  }

  async getOrder(orderId) {
    const systemOrders = await this.findOne({
      where: {app: 'system', refId: 'system', action: 'orders'},
    });
    const systemOrder = systemOrders.data.find(
      order => order.orderId == orderId,
    );
    const user = await this.getUser(systemOrder.userId);
    const balconyOrders = await this.findOne({
      where: {
        app: 'staff',
        refId: systemOrder.balconyId,
        action: 'balcony-orders',
      },
    });
    const balconyOrder = balconyOrders.data.find(
      order => order.orderId == orderId,
    );
    return balconyOrder;

    //"orderId":"0b2811f2-aa86-4486-8e85-6046490c40e6","action":"ONHOLD","title":"ONHOLD","staffId":"e5ed35ae-f951-4a70-a129-e298a92c07cc","timelineKey":"ONHOLD","staff":{"deleted":false,"deletedOn":null,"deletedBy":null,"id":"e5ed35ae-f951-4a70-a129-e298a92c07cc","created_at":"2024-09-30T04:30:23.982Z","updated_at":"
  }

  async getOrderFromSystemOrders(orderId: string) {
    const systemOrders = await this.getSystemOrders();
    const systemOrder = systemOrders.find((o: any) => o.orderId == orderId);
    const balconyOrders = await this.getBalconyOrders(systemOrder.balconyId);
    const order = balconyOrders.data.find((o: any) => o.orderId == orderId);
    return order;
  }
  async getSystemOrders() {
    //await this.findById(this.systemOrdersId);´
    const orders = await this.findOrCreateByAction(
      'system',
      'orders',
      'system',
      [],
    );
    return orders.data;
  }

  private systemOrdersId: string;
  async init() {
    try {
      const systemOrders = await this.findOrCreateByAction(
        'system',
        'orders',
        'system',
        [],
      );
      this.systemOrdersId = systemOrders.id;
    } catch (ex) {
      console.log(ex);
    }
  }
}

// getBalconyOrders Where balconyId = 09f763fa-eea6-48b1-bb6b-fd8cfd69b069
// Get staff from that balcony
// Find all staff where active = true

/*

balconyOrders = this.devRepository.findOne({where:{app:'staff',refId:'09f763fa-eea6-48b1-bb6b-fd8cfd69b069',action:'balcony-orders'}})"
orders = this.devRepository.findOne({where:{app:'system',refId:'system',action:'orders'}})
order = this.devRepository.getOrder('0b2811f2-aa86-4486-8e85-6046490c40e6')
*/
