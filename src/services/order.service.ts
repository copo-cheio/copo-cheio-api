import {AuthenticationBindings} from '@loopback/authentication';
import {/* inject, */ BindingScope, inject, injectable} from '@loopback/core';
import {IsolationLevel, repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {v4, v7} from 'uuid';
import {OrderSingleFull} from '../blueprints/shared/order.include';
import {DEFAULT_MODEL_ID} from '../constants';
import {
  ORDER_BALCONY_STATUS,
  ORDER_COMPLETE_STATUS,
  ORDER_READY_STATUS,
  ORDER_STATUS,
} from '../models';
import {
  CheckInV2Repository,
  CredentialRepository,
  DevRepository,
  ImageRepository,
  OrderDetailsV2Repository,
  OrderItemRepository,
  OrderItemsV2Repository,
  OrderRepository,
  OrderTimelineRepository,
  OrderV2Queries,
  OrderV2Repository,
  OrderV2Transformers,
  PlaceRepository,
  PriceRepository,
} from '../repositories';
import {EncryptionProvider} from './encryption.service';
import {
  PUSH_NOTIFICATION_SUBSCRIPTIONS,
  PushNotificationService,
} from './push-notification.service';
import {QrFactoryService} from './qr-factory.service';
import {TransactionService} from './transaction.service';

@injectable({scope: BindingScope.TRANSIENT})
export class OrderService {
  constructor(
    /* Add @inject to inject parameters */
    @repository('OrderRepository')
    public orderRepository: OrderRepository,
    @repository('OrderV2Repository')
    public orderV2Repository: OrderV2Repository,
    @repository('OrderDetailsV2Repository')
    public orderDetailsV2Repository: OrderDetailsV2Repository,
    @repository('OrderItemsV2Repository')
    public orderItemsV2Repository: OrderItemsV2Repository,
    @repository('OrderTimelineRepository')
    public orderTimelineRepository: OrderTimelineRepository,
    @repository('PriceRepository')
    public priceRepository: PriceRepository,
    @repository('ImageRepository')
    public imageRepository: ImageRepository,
    @repository('OrderItemRepository')
    public orderItemRepository: OrderItemRepository,
    @repository('DevRepository')
    public devRepository: DevRepository,
    @repository('CheckInV2Repository')
    public checkInV2Repository: CheckInV2Repository,
    @repository('PlaceRepository')
    public placeRepository: PlaceRepository,
    @inject('services.PushNotificationService')
    private pushNotificationService: PushNotificationService,
    @inject('services.QrFactoryService')
    protected qrFactoryService: QrFactoryService,
    @repository('CredentialRepository')
    public credentialRepository: CredentialRepository,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private currentUser: UserProfile, // Inject the current user profile
    @inject('services.TransactionService')
    private transactionService: TransactionService,

    @inject('services.EncryptionProvider')
    public encriptionService: EncryptionProvider,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                     V2                                     */
  /* -------------------------------------------------------------------------- */

  /**
   * Steps:
   * Find user.uid, order, balcony
   * @param order
   * @returns
   */

  /**
   * OrderV2
   *   userId
   *   placeId
   *   balconyId
   *   eventId
   *   status
   *   code
   *   orderInfoId -> refers to orderInfoId
   *   paymentId ->
   *
totalPrice : 12.9

   * @param order
   * @returns
   */

  validateOrderV2(payload: any = {}) {
    const currentUser = this.currentUser;
    let success = false;
    let order: any = {};
    return this.transactionService.execute(async tx => {
      const orderV2 = await this.orderV2Repository.findById(payload.refId);
      const status = 'COMPLETE';
      if (orderV2.status == 'READY') {
        const code = orderV2.code;
        const decription = await this.encriptionService.comparePassword(
          payload.code,
          code,
        );
        if (decription) {
          await this.orderV2Repository.updateById(orderV2.id, {
            status,
            code: '',
            active: false,
          });
          await this.orderTimelineRepository.create({
            orderV2Id: orderV2.id,
            action: status,
            title: status,
            timelineKey: status,
            staffId: currentUser.id,
          });
          /*   await this.updateSystemOrderStatusByOrderId(refId, 'COMPLETE'); */
          success = true;
          order = await this.orderV2Repository.findById(
            orderV2.id,
            OrderV2Queries.full,
          );
          this.notifyUserV2(order.userId, 'ORDER_COMPLETE', {});
          this.notifyUserV2(order.userId, 'ORDER_UPDATE', {});
        }
      }
      return success
        ? {...OrderV2Transformers.full(order), success}
        : {success};
    });
  }
  createOrderV2(payload: any) {
    const currentUser = this.currentUser;
    return this.transactionService.execute(async tx => {
      const status = ORDER_STATUS[0];
      const user = this.currentUser;
      const userId = user.id;
      const userUid = user.uid;

      const price = await this.priceRepository.create({
        price: payload.order.totalPrice,
        currencyId: DEFAULT_MODEL_ID.currencyId,
      });
      const placeInstance = await this.placeRepository.findCurrentInstanceById(
        payload.placeId,
      );
      const orderV2Payload = {
        userId,
        balconyId: payload.balconyId,
        userUid: currentUser.uid,
        placeId: payload.placeId,
        status,
        priceId: price.id,
        placeInstanceId: placeInstance?.id,
      };

      const orderV2 = await this.orderV2Repository.create(orderV2Payload);

      const orderDetailsV2Payload = {
        productCount: payload.order.productCount,
        productsPrice: payload.order.productsPrice,
        serviceFee: payload.order.serviceFee,
        totalPrice: payload.order.totalPrice,
        orderV2Id: orderV2.id,
      };
      await this.orderDetailsV2Repository.create(orderDetailsV2Payload);

      for (const menuProduct of payload.items) {
        for (const orderItem of menuProduct.items) {
          const itemOptions = orderItem.selectedOptions || [];

          await this.orderItemsV2Repository.create({
            orderV2Id: orderV2.id,
            calculatedPrice: orderItem.calculatedPrice,
            basePrice: parseFloat(orderItem?.price?.price),
            menuProductId: orderItem.menuProductId,
            optionIds: itemOptions.map(option => option.id),
          });
        }
      }

      await this.orderTimelineRepository.create({
        orderV2Id: orderV2.id,
        action: status,
        title: status,
        timelineKey: status,
        staffId: this.currentUser.id,
      });

      const order = await this.orderV2Repository.findById(
        orderV2.id,
        OrderV2Queries.full,
      );
      return order;
    });
  }
  onOrderPaymentCompleteV2(payload: any) {
    const currentUser = this.currentUser;
    return this.transactionService.execute(async tx => {
      const status = ORDER_STATUS[3];
      const user = this.currentUser;
      const orderId = payload.orderId;
      const orderV2Payload = {
        status,
      };

      await this.orderV2Repository.updateById(orderId, orderV2Payload);

      await this.orderTimelineRepository.create({
        orderV2Id: orderId,
        action: status,
        title: status,
        timelineKey: status,
        staffId: this.currentUser.id,
      });

      const order = await this.orderV2Repository.findById(
        orderId,
        OrderV2Queries.full,
      );

      const checkIn = await this.checkInV2Repository.findUserCheckIn(
        this.currentUser.id,
      );
      await this.checkInV2Repository.updateById(checkIn.id, {
        orderV2Id: orderId,
      });

      this.notifyBalconyStaffV2(order.balconyId, 'ORDER_RECIEVE', {})
        .then(console.log)
        .catch(console.warn);

      return order;
    });
  }

  onUpdateOrderV2(orderId, status) {
    const currentUser = this.currentUser;

    return this.transactionService.execute(async tx => {
      const order = await this.orderV2Repository.findById(orderId);

      const currentStatus = order.status;
      const currentStatusIndex = ORDER_BALCONY_STATUS.indexOf(currentStatus);
      const statusIndex = ORDER_BALCONY_STATUS.indexOf(status);

      if (
        [currentStatusIndex, statusIndex].indexOf(-1) > -1 ||
        currentStatusIndex >= statusIndex
      ) {
        throw new Error('Invalid status');
      }
      let notifyBalcony = false;
      if (status == 'ONGOING') {
        notifyBalcony = true;
        // Notify the balcony that someone has changed a status
      }
      let code: any | undefined;
      let qrCode: any | undefined;
      const payload: any = {status};
      if (status == 'READY') {
        const codes: any = await this.generateOrderQrCode(order, status);
        code = codes.order.code;

        payload.code = code;
      }
      await this.orderV2Repository.updateById(orderId, payload);
      await this.orderTimelineRepository.create({
        orderV2Id: orderId,
        action: status,
        title: status,
        timelineKey: status,
        staffId: this.currentUser.id,
      });

      const updatedOrder = await this.orderV2Repository.findById(
        orderId,
        OrderV2Queries.full,
      );

      if (notifyBalcony) {
        this.notifyBalconyStaffV2(updatedOrder.balconyId, 'ORDER_UPDATE', {})
          .then(console.log)
          .catch(console.log);
      }
      this.notifyUserV2(order.userId, 'ORDER_UPDATE', {});

      return updatedOrder;
    });
  }

  async generateOrderQrCode(order: any = {}, status: string) {
    const code = v7();
    order.code = await this.encriptionService.hashPassword(code);

    const payload = {
      action: 'VALIDATE_ORDER',
      type: 'order',
      code: code,
      refId: order.orderId || order.id,
    };
    const qrCode = await this.qrFactoryService.generateAndUploadQrCode(
      payload,
      order.orderId || order.id,
      'qr code for dev order',
    );
    return {order, code, qrCode};
  }

  async findByOrderByIdV2(id: string) {
    id = 'b39ffdc0-9e89-48ad-8169-865de0f40944';
    const order = await this.orderV2Repository.findById(
      id,
      OrderV2Queries.full,
    );

    return OrderV2Transformers.full(order);
  }

  async findUserOrders() {
    const orders = await this.orderV2Repository.findAll({
      ...OrderV2Queries.full,
      where: {...OrderV2Queries.full.where, userId: this.currentUser.id},
    });

    return OrderV2Transformers.full(orders);
  }

  async notifyBalconyStaffV2(
    balconyId: string,
    action: string,
    data: any = {},
  ) {
    const ACTIONS: any = {
      ORDER_RECIEVED: {
        title: 'staff',
        body: 'new order',
      },
      ORDER_RECIEVE: {
        title: 'staff',
        body: 'new order',
      },
      ORDER_UPDATE: {
        title: 'staff',
        body: 'new orders updated',
      },
    };

    const {title, body} = ACTIONS[action];
    const balconyStaff = await this.checkInV2Repository.findAll({
      where: {
        and: [{app: 'staff'}, {balconyId}, {active: true}],
      },
      include: [{relation: 'user'}],
    });

    for (const staff of balconyStaff || []) {
      const staffId = staff.userId;
      try {
        if (staffId) {
          console.log('Will notify staff', staffId);
          this.pushNotificationService
            .notifyUser(staffId, {title, body}, {action, data})
            .then(console.log)
            .catch(console.warn);
        }
      } catch (ex) {
        console.log('Failed to notify staff');
      }
    }
    return '';
  }
  notifyUserV2(userId: string, action: string, data: any = {}) {
    const ACTIONS: any = {
      ORDER_RECIEVED: {
        title: 'user',
        body: 'new order',
      },
      ORDER_RECIEVE: {
        title: 'user',
        body: 'new order',
      },
      ORDER_UPDATE: {
        title: 'user',
        body: 'order updated',
      },
    };

    const {title, body} = ACTIONS[action] || {};
    this.pushNotificationService
      .notifyUser(userId, {...ACTIONS[action]}, {action, payload: data})
      .then(console.log)
      .catch(console.warn);
  }
  notifyUser(userId: string, action: string, data: any = {}) {
    const ACTIONS: any = {
      ORDER_RECIEVED: {
        title: 'user',
        body: 'new order',
      },
      ORDER_UPDATE: {
        title: 'user',
        body: 'Order status updated',
      },
    };
    const {title, body} = ACTIONS[action];
    this.pushNotificationService
      .notifyUser(userId, {...ACTIONS[action]}, {action, payload: data})
      .then(console.log)
      .catch(console.warn);
    /*   this.devRepository
      .notifyBalconyStaff(balconyId, title, body, {
        action,
        payload: data,
      })
      .then(console.log)
      .catch(console.warn); */
  }

  /*
   * Add service methods here
   */
  async updateStatusById(id: string, data: any = {}) {
    const transaction = await this.orderRepository.dataSource.beginTransaction(
      IsolationLevel.SERIALIZABLE,
    );
    try {
      const orderPayload: any = {
        status: data.status,
      };
      if (data.status == ORDER_READY_STATUS) {
        const record = await this.orderRepository.findById(id);
        let image = await this.imageRepository.findOne({
          where: {
            refId: id,
            type: 'qr',
          },
        });
        if (!image) {
          const qrRecord = await this.qrFactoryService.generateAndUploadQrCode(
            {
              action: 'VALIDATE_ORDER',
              type: 'order',
              code: record.code,
              refId: id,
            },
            id,
            'order',
          );
          image = await this.imageRepository.findOne({
            where: {
              refId: id,
              type: 'qr',
            },
          });
        }
        if (image) {
          await this.imageRepository.updateById(image?.id, {
            orderId: id,
          });
        }
      }
      await this.orderRepository.updateById(id, {status: data.status});
      await this.orderTimelineRepository.create({
        orderId: id,
        timelineKey: data.status,
        staffId: this.currentUser.id,
        action: data.status,
        title: data.status,
      });

      const _order = await this.notifyOrderStatusUpdate(id);
      await transaction.commit();

      return _order;
    } catch (ex) {
      await transaction.rollback();
      console.warn(ex);
      throw new HttpErrors.UnprocessableEntity();
    }
  }

  async validateOrder(qr: any): Promise<any> {
    const transaction = await this.orderRepository.dataSource.beginTransaction(
      IsolationLevel.SERIALIZABLE,
    );
    const code = qr.code;
    const type = 'qr';
    const refId = qr.refId;
    try {
      const image = await this.imageRepository.findOne({
        where: {
          type,
          refId,
        },
      });

      if (image) {
        const order = await this.orderRepository.findOne({
          where: {
            id: refId,
            code,
          },
        });
        if (!order) {
          throw new Error('ORDER_NOT_FOUND');
        }

        if (order?.status !== ORDER_READY_STATUS) {
          const index = ORDER_STATUS.indexOf(order?.status || '');
          throw new Error(
            index > ORDER_STATUS.indexOf(ORDER_READY_STATUS) - 1
              ? 'QR_USED'
              : 'QR_INVALID',
          );
        } else {
          await this.orderRepository.updateById(refId, {
            status: ORDER_COMPLETE_STATUS,
          });
          await this.orderTimelineRepository.create({
            orderId: refId,
            staffId: this.currentUser.id,

            timelineKey: ORDER_COMPLETE_STATUS,
            // staffId: this.currentUser.id,
            action: ORDER_COMPLETE_STATUS,
            title: ORDER_COMPLETE_STATUS,
          });
          await transaction.commit();
          const order = await this.notifyOrderStatusUpdate(refId);

          return {
            success: true,
            order,
          };
        }
      } else {
        throw new Error('QR_NOT_FOUND');
      }
    } catch (e) {
      await transaction.rollback();
      console.log(e); // Error: Transaction is rolled back due to timeout
      console.log(e.code); // TRANSACTION_TIMEOUT

      let order: any = await this.orderRepository.findById(
        refId,
        OrderSingleFull,
      );
      order = order ? order.toJSON() : {};
      if (e.message == 'QR_NOT_FOUND') {
        throw new HttpErrors.NotFound();
      } else if (e.message == 'QR_USED') {
        // throw new HttpErrors.UpgradeRequired();
        return {
          success: false,
          reason: 'CODE_USED_BEFORE',
          order: order,
        };
        // throw new HttpErrors.NotAcceptable();
      } else if (e.message == 'QR_INVALID') {
        // throw new HttpErrors.UpgradeRequired();
        const order = await this.orderRepository.findById(
          refId,
          OrderSingleFull,
        );
        return {
          success: false,
          reason: 'CODE_NOT_READY',
          order: order,
        };
      } else {
        // throw new HttpErrors.UnprocessableEntity();
        // throw new HttpErrors.UpgradeRequired();
        const order = await this.orderRepository.findById(
          refId,
          OrderSingleFull,
        );
        return {
          success: false,
          reason: 'ORDER_NOT_FOUND',
          order: order,
        };
      }
    }
  }

  async create(order: any) {
    const transaction = await this.orderRepository.dataSource.beginTransaction(
      IsolationLevel.SERIALIZABLE,
    );
    try {
      const userId = this.currentUser.id;
      const status = ORDER_STATUS[0];
      const fees = '0';
      const {menuId, placeId, balconyId, totalPrice, itemCount} = order;
      const record = await this.orderRepository.create({
        userId,
        status,
        fees,
        placeId,
        balconyId,
        totalPrice,
        itemCount,
        code: v4(),
      });
      for (const orderItem of order.orderItems) {
        await this.orderItemRepository.create({
          orderId: record.id,
          count: orderItem.count,
          currentPrice: orderItem.curentPrice,
          totalPrice: orderItem.currentTotalPrice,
          menuProductId: orderItem.menuProduct,
          productOptionIds: orderItem.productOptionIds || [],
        });
      }
      const price = await this.priceRepository.create({
        price: Number(totalPrice),
        currencyId: 'bc6635ea-7273-4518-b18a-c066fb300b1f',
      });
      await this.orderRepository.updateById(record.id, {
        priceId: price.id,
      });
      await this.orderTimelineRepository.create({
        orderId: record.id,
        staffId: this.currentUser.id,

        timelineKey: 'RECEIVED',
        // staffId: this.currentUser.id,
        action: 'RECEIVED',
        title: 'RECEIVED',
      });
      await transaction.commit();
      // return this.orderRepository.findById(record.id, OrderSingleFull);
      // await this.pushNotificationService.sendTopicNotification(PUSH_NOTIFICATION_SUBSCRIPTIONS.checkIn.staff[1](placeId,"",balconyId), {
      //   action: "NEW_ORDER",
      //   payload: {
      //     id: record.id
      //   }
      // })
      return await this.orderRepository.findOne({
        ...OrderSingleFull,
        where: {id: record.id},
      });
    } catch (e) {
      await transaction.rollback();
      console.log(e); // Error: Transaction is rolled back due to timeout
      console.log(e.code); // TRANSACTION_TIMEOUT
      throw new HttpErrors.UnprocessableEntity();
    }
  }

  /* ********************************** */
  /*            SERVICE STUFF           */
  /* ********************************** */
  async notifyOrderStatusUpdate(id: string) {
    const order: any = await this.orderRepository.findOne({
      ...OrderSingleFull,
      where: {id: id},
    });

    const notification = {
      title: 'Order updated',
      body: 'Your order status is now: ' + order.status,
    };
    const _order = order.toJSON();
    const payload = {
      id: _order.id,
      qr: _order?.qr?.url,
      place: _order.placeId,
      balcony: _order.balconyId,
    };

    const action =
      order?.status == ORDER_READY_STATUS
        ? 'ORDER_READY'
        : order?.status == ORDER_COMPLETE_STATUS
          ? 'ORDER_COMPLETE'
          : 'OPEN_ORDER';
    const notificationData = {
      action: action,
      payload: payload,
    };

    await this.pushNotificationService.notifyUser(
      order.userId,
      notification,
      notificationData,
    );

    if (ORDER_STATUS.indexOf(order.status) > ORDER_STATUS.indexOf('ONHOLD')) {
      await this.pushNotificationService.sendTopicNotification(
        PUSH_NOTIFICATION_SUBSCRIPTIONS.checkIn.staff[0](
          _order.placeId,
          '',
          _order.balconyId,
        ),
        {
          action: 'ORDER_UPDATED',
          payload: {
            id: id,
            status: order.status,
          },
        },
      );
    }

    return order;
  }
}
