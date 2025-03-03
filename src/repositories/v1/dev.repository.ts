import {Getter, inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {v7} from 'uuid';
import {
  BalconyFullQuery,
  BalconySimpleQuery,
} from '../../blueprints/balcony.blueprint';
import {
  BasePlacesQuery,
  PlaceQueryFull,
} from '../../blueprints/place.blueprint';
import {PostgresSqlDataSource} from '../../datasources';
import {Dev, DevRelations} from '../../models';
import {
  AuthService,
  EncryptionProvider,
  QrFactoryService,
} from '../../services';
import {createTimeline} from '../../services/dev/dev.utils';
import {PushNotificationService} from '../../services/push-notification.service';

import {BaseRepository} from '../base.repository.base';
import {MenuRepository} from './menu.repository';
import {OrderRepository} from './order.repository';

import {CheckInV2Repository} from '../check-in-v2.repository';
import {BalconyRepository} from './balcony.repository';
import {PlaceRepository} from './place.repository';
import {StockRepository} from './stock.repository';
import {UserRepository} from './user.repository';

const generateTimeline = (status, orderId, staffId, staff) => {
  return {
    id: '12ab87d2-73ff-4a79-872c-89390b4cde84',
    created_at: new Date().toISOString(),

    orderId: orderId,
    action: status,
    title: status,
    staffId: staffId,
    timelineKey: status,
    staff: staff,
  };
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
    @repository.getter('StockRepository')
    private getStockRepository: Getter<StockRepository>,
    @repository.getter('CheckInV2Repository')
    private getCheckInV2Repository: Getter<CheckInV2Repository>,
    @inject('services.PushNotificationService')
    private pushNotificationService: PushNotificationService,
    @inject('services.AuthService')
    private authService: AuthService,

    @inject('services.EncryptionProvider')
    public encriptionService: EncryptionProvider,
    @inject('services.QrFactoryService') public qrService: QrFactoryService,
  ) {
    super(Dev, dataSource);
    try {
      this.init();
    } catch (ex) {
      console.log(ex);
    }
  }

  async migrate(balconyId?: any) {
    const balconyRepository = await this.getBalconyRepository();
    const menuRepository = await this.getMenuRepository();
    const stockRepository = await this.getStockRepository();
    let balconies;
    if (balconyId) {
      balconies = await balconyRepository.findById(balconyId);
      balconies = [balconies];
    } else {
      balconies = await balconyRepository.findAll();
    }
    const response: any = {
      menus: {},
      balconies: {},
    };

    for (const b of balconies) {
      if (!response.balconies[b.id]) {
        response.balconies[b.id] = [];
      }
      if (!response.menus[b.menuId]) {
        response.menus[b.menuId] = [];
        const ingredientIds = [];
        const menu = await menuRepository.findById(b.menuId, {
          include: [
            {
              relation: 'products',
              scope: {
                include: [
                  {
                    relation: 'product',
                    scope: {
                      include: [
                        {relation: 'ingredients'},
                        {relation: 'options'},
                      ],
                    },
                  },
                ],
              },
            },
          ],
        });
        const products = menu.products || [];
        for (const p of products) {
          // @ts-ignore
          const ingredients = p?.product?.ingredients || [];
          // @ts-ignore
          const options = p?.product?.options || [];
          for (const ingredient of ingredients) {
            ingredientIds.push(ingredient.ingredientId);
          }
          for (const ingredient of options) {
            ingredientIds.push(ingredient.ingredientId);
          }
        }
        response.menus[b.menuId] = [...new Set(ingredientIds)];
      }
      response.balconies[b.id] = response.menus[b.menuId];

      for (const ing of response.menus[b.menuId]) {
        const entry = await stockRepository.findOne({
          where: {balconyId: b.id, ingredientId: ing},
        });
        if (!entry) {
          await stockRepository.create({
            balconyId: b.id,
            ingredientId: ing,
            status: 'OUT_OF_STOCK',
          });
        }
      }

      await stockRepository.deleteAll({
        and: [
          {balconyId: b.id},
          {ingredientId: {nin: response.menus[b.menuId]}},
        ],
      });
    }

    return response.balconies;
  }

  async getBalconyFull(balconyId) {
    const balconyRepository = await this.getBalconyRepository();
    const balcony: any = await balconyRepository.findById(
      balconyId,
      BalconyFullQuery,
    );
    const stocks = balcony.stocks || [];
    balcony.menu.products = balcony.menu.products || [];
    const inStock = stocks
      .filter((s: any) => s.status == 'IN_STOCK')
      .map((s: any) => s.ingredientId);
    const outOfStock = stocks
      .filter((s: any) => s.status == 'OUT_OF_STOCK')
      .map((s: any) => s.ingredientId);
    balcony.menu.products = [
      ...balcony.menu.products.map((menuProduct: any) => {
        const product = menuProduct.product;

        let options = product.options || [];

        let ingredients = product.ingredients || [];

        product.available = true;
        menuProduct.available = true;
        options = [
          ...options.map((o: any) => {
            const isAvailable = inStock.indexOf(o.ingredientId) > -1;

            return {
              ...o,
              available: isAvailable,
              ingredient: {...o.ingredient, available: isAvailable},
            };
          }),
        ];
        ingredients = [
          ...ingredients.map((i: any) => {
            const isAvailable = inStock.indexOf(i.ingredientId) > -1;
            if (!isAvailable) {
              // console.log('INGREDIENT NA', i.ingredientId, product);
              product.available = false;
              menuProduct.available = false;
            }
            return {...i, available: isAvailable};
          }),
        ];
        product.options = [...options];
        product.ingredients = [...ingredients];
        return {...menuProduct, product: {...product}};
      }),
    ];

    balcony.inStock = inStock;
    return balcony;
  }

  async onUpdateStockStatus(app, refId, data: any = {}) {
    const stockRepository = await this.getStockRepository();
    const balconyRepository = await this.getBalconyRepository();
    const status = data.status;
    const stock = await stockRepository.updateById(data.stockId, {
      status: data.status,
    });
  }

  async getUserProfile(app: string, refId: any = {}) {
    const user = await this.findByAction('user', 'sign-up', refId);
    const staff = await this.findByAction('staff', 'sign-up', refId);
    const lastSignInUser = await this.findByAction('user', 'sign-in', refId);
    const lastSignInStaff = await this.findByAction('staff', 'check-in', refId);

    const placeRepository: any = await this.getPlaceRepository();
    const balconyRepository: any = await this.getBalconyRepository();
    const systemOrders: any = await this.getSystemOrders();
    const userActivity: any = systemOrders.filter(so => so.userId == refId);
    const userPlaces = await placeRepository.findAll({
      where: {
        id: {
          inq: [...new Set(userActivity.map((ua: any) => ua.placeId))],
        },
      },
      ...BasePlacesQuery,
    });
    const response: any = {
      user: {
        ...lastSignInUser.data,
        created_at: user.created_at,
        places: userPlaces,
        totalOrders: userActivity.length,
      },
    };
    if (staff) {
      const balconies = await this.findAll({
        where: {app: 'staff', action: 'balcony-orders'},
      });
      const staffPlaceIds = [];
      for (const balcony of balconies) {
        const worksHere = balcony.data.find(b => {
          return b.staffId == refId;
        });
        if (worksHere) {
          staffPlaceIds.push(balcony.refId);
        }
      }
      const staffBalconies = await balconyRepository.findAll({
        where: {
          id: {
            inq: [...new Set(staffPlaceIds)],
          },
        },
        ...BalconySimpleQuery,
      });
      const staffPlaces: any = [];

      response.staff = {
        ...lastSignInStaff.data,
        created_at: staff.created_at,
        places: staffBalconies
          .filter(b => {
            const idx = staffPlaces.indexOf(b.placeId);
            if (idx == -1) {
              staffPlaces.push(b.placeId);
              return true;
            }
            return false;
          })
          .map(b => b.place),
        balconies: staffBalconies,
      };
    }

    return response;
  }

  async onUpdateOrderStatus(app: string, refId: string, data: any = {}) {
    const result = await this.updateOrder(app, refId, data);
    await this.updateSystemOrderStatusByOrderId(refId, data.status);
    return result;
    /*     const order = await this.getOrderFromSystemOrders(refId);

    return {order, data}; */
  }

  async validateOrder(app: string, refId: string, data: any = {}) {
    const response: any = {
      success: false,
    };
    const systemOrder = await this.findByIdInList(
      () => this.findByAction('system', 'orders', 'system'),
      refId,
      'orderId',
    );

    if (systemOrder.item.status == 'READY') {
      const code = systemOrder.item.code;
      const decription = await this.encriptionService.comparePassword(
        data.code,
        code,
      );
      if (decription) {
        await this.updateOrder('staff', refId, {
          status: 'COMPLETE',
          staffId: data.staffId,
        });
        await this.updateSystemOrderStatusByOrderId(refId, 'COMPLETE');
        response.success = true;
      }
    }
    response.order = await this.getOrder(refId);

    return response;
  }

  async generateOrderQrCode(order: any = {}, status: string) {
    const code = v7();
    order.code = await this.encriptionService.hashPassword(code);

    const payload = {
      action: 'VALIDATE_ORDER',
      type: 'order',
      code: code,
      refId: order.orderId,
    };
    const qrCode = await this.qrService.generateAndUploadQrCode(
      payload,
      order.orderId,
      'qr code for dev order',
    );
    return {order, qrCode};
  }

  async onGetUserOrders(app: any, refId: string) {
    const orders = await this.getUserOrders(refId);
    return orders.data;
  }

  async updateOrder(app: any, refId: string, data: any) {
    const status = data.status;
    const systemOrder = await this.findByIdInList(
      () => this.findByAction('system', 'orders', 'system'),
      refId,
      'orderId',
    );
    const systemOrderIndex = systemOrder.index;
    let qrCode: any = null;
    if (status == 'READY') {
      const updatedSystemOrder: any = await this.generateOrderQrCode(
        systemOrder.item,
        status,
      );
      const systemOrders = await this.findByAction(
        'system',
        'orders',
        'system',
      );
      systemOrders.data[systemOrder.index] = {
        ...updatedSystemOrder.order,
        status: status,
      };

      await this.updateById(systemOrders.id, {
        ...systemOrders,
        data: [...systemOrders.data],
      });

      qrCode = updatedSystemOrder.qrCode;
    }

    const {placeId, balconyId, orderId, userId} = systemOrder.item;
    const balconyOrder = await this.findByIdInList(
      () => this.findByAction('staff', 'balcony-orders', balconyId),
      orderId,
      'orderId',
    );

    const staff = await this.getStaff(data.staffId);
    const user = await this.getUser(userId);
    const balconyOrderIndex = balconyOrder.index;
    const order = balconyOrder.item;
    order.status = status;
    if (qrCode) {
      order.qrCode = qrCode;
    }
    order.timeline.push(generateTimeline(status, orderId, data.staffId, staff));
    const userOrder = await this.findOrCreateThenUpdateByAction(
      'user',
      'user-order',
      userId,
      order,
    );

    const bo = await this.getBalconyOrders(balconyId);
    bo.data[balconyOrderIndex] = order;
    await this.updateById(bo.id, {...bo, data: bo.data});

    const userOrderIndex = await this.findByIdInList(
      () => this.findByAction('user', 'user-orders', userId),
      orderId,
      'orderId',
    );

    const uo = await this.getUserOrders(userId);
    uo.data[userOrderIndex.index] = order;
    await this.updateById(uo.id, {...uo, data: uo.data});

    const payload = {
      action: 'ORDER_UPDATE',
      payload: {status, level: 1, orderId},
    };

    try {
      console.log('will try to notify user', user);
      await this.notify(
        'user update',
        'user order updated',
        user.pushNotificationToken,
        payload,
      );
    } catch (ex) {
      console.log('failed to notify user', user);
    }
    const staffPayload = {action: 'ORDER_UPDATE', payload: {order: {}}};
    await this.notifyBalconyStaff(
      balconyId,
      'staff',
      'order updated',
      staffPayload,
    );

    return {order};
  }
  async updateSystemOrderStatusByOrderId(orderId, status) {
    const systemOrder = await this.findByIdInList(
      () => this.findByAction('system', 'orders', 'system'),
      orderId,
      'orderId',
    );
    const systemOrders = await this.findByAction('system', 'orders', 'system');
    systemOrders.data[systemOrder.index] = {
      ...systemOrders.data[systemOrder.index],
      status: status,
    };
    return this.updateById(this.systemOrdersId, {...systemOrders});
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
            timeline: [],
          },
        },
        timeline: [createTimeline(record.data.id, 'ONHOLD')],
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
      data: userOrders.data
        .filter((o: any) => o)
        .map((o: any) => {
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

    const staffPayload = {action: 'ORDER_RECIEVED', payload: {order: {}}};
    await this.notifyBalconyStaff(
      record.data.balconyId,
      'staff',
      'new order',
      staffPayload,
    );

    return record;
  }

  async createUserOrder(app: string, refId: string, data: any = {}) {
    const order = data;
    const status = data.status;
    const user = await this.getUser(refId);
    let record = await this.findByAction(app, 'user-order', refId);
    if (record?.id) {
      await this.deleteById(record.id);
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
          created_at: new Date().toISOString(),
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

  async onOrderChange() {}

  async notify(title, body, token, payloadData) {
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

  async notifyBalconyStaff(balconyId, title, body, payload) {
    try {
      const balconyStaff = await this.getBalconyStaff(balconyId);

      for (const s of balconyStaff || []) {
        try {
          if (s?.pushNotificationToken) {
            console.log('Will notify staff', s);
            await this.notify(title, body, s.pushNotificationToken, payload);
          }
        } catch (ex) {
          console.log('Failed to notify staff');
        }
      }
    } catch (ex) {
      console.warn(ex);
    }
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
    const action = app == 'staff' ? 'findStaffCheckIn' : 'findUserCheckIn';
    const checkInV2Repository = await this.getCheckInV2Repository();
    const checkIn = await checkInV2Repository[action](refId);
    return this.authService.checkInOutV2(
      false,
      refId,
      app,
      'place',
      checkIn?.role,
      checkIn?.expiresAt,
      checkIn?.placeId,
      checkIn?.balconyId,
      checkIn?.eventId,
    );
    // Is signed up?

    /*     const record = await this.findByAction(app, refId, 'check-in');
    await this.updateById(record.id, {
      ...record,
      data: {...record.data, active: false},
    });
    return {success: true}; */
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

  async signOut(app: any, refId: any) {
    // Is signed up?
    const record = await this.findByAction(app, 'sign-in', refId);

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
    const orders: any = await this.findOrCreateByAction(
      'user',
      'user-orders',
      refId,
      [],
    );

    const places: any = {};
    const placeRepository = await this.getPlaceRepository();
    const data: any = [];
    for (const order of orders.data) {
      if (!order.placeId) {
        continue;
      }
      if (!places.hasOwnProperty(order.placeId)) {
        const place = await placeRepository.findById(
          order.placeId,
          PlaceQueryFull,
        );
        places[order.placeId] = {
          placeId: order.placeId,
          place: place,
          items: [],
        };
      }
      places[order.placeId].items.push(order);
      order.place = places[order.placeId].place;
      data.push(order);
    }

    return {
      ...orders,
      data: [...data],
    };
  }
  async getBalconyOrders(balconyId: string, b?: any) {
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
    const orders = await this.findByAction('system', 'orders', 'system');
    const order = {placeId, balconyId, orderId, userId};

    await this.updateById(orders.id, {
      ...orders,
      data: [...orders.data, order],
    });
    await this.updateSystemOrderStatusByOrderId(orderId, 'WAITING_PAYMENT');
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

  async findByIdInList(listFn, itemId, key = 'id') {
    const record = await listFn();

    const records = record.data;
    const index = records.findIndex(r => r[key] == itemId);
    const item = records[index];
    return {index, item, record};
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
