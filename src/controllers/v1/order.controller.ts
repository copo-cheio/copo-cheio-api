import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {OrderSingleFull} from '../../blueprints/shared/order.include';
import {
  Order,
  ORDER_COMPLETE_STATUS,
  ORDER_READY_STATUS,
  ORDER_STATUS,
} from '../../models';
import {
  ActivityRepository,
  CredentialRepository,
  ImageRepository,
  OrderItemRepository,
  OrderRepository,
  OrderTimelineRepository,
  PlaceRepository,
  PriceRepository,
} from '../../repositories';
import {
  OrderService,
  PUSH_NOTIFICATION_SUBSCRIPTIONS,
  PushNotificationService,
  QrFactoryService,
} from '../../services';

export class OrderController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
    @repository(OrderTimelineRepository)
    public orderTimelineRepository: OrderTimelineRepository,
    @repository(PriceRepository)
    public priceRepository: PriceRepository,
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,
    @repository(ImageRepository)
    public imageRepository: ImageRepository,
    @repository(OrderItemRepository)
    public orderItemRepository: OrderItemRepository,
    @inject('services.PushNotificationService')
    private pushNotificationService: PushNotificationService,
    @inject('services.QrFactoryService')
    protected qrFactoryService: QrFactoryService,
    @repository(CredentialRepository)
    public credentialRepository: CredentialRepository,
    @repository(ActivityRepository)
    public activityRepository: ActivityRepository,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private currentUser: UserProfile, // Inject the current user profile,
    @inject('services.OrderService')
    protected orderService: OrderService,
  ) {}

  @post('/validate/order')
  @authenticate('firebase')
  @response(200, {
    description: 'Order model instance',
    content: {'application/json': {schema: getModelSchemaRef(Order)}},
  })
  async validateOrder(
    @requestBody({
      content: {},
    })
    qr: any,
  ): Promise<any> {
    return this.orderService.validateOrder(qr);
  }

  @post('/orders')
  @authenticate('firebase')
  @response(200, {
    description: 'Order model instance',
    content: {'application/json': {schema: getModelSchemaRef(Order)}},
  })
  async create(
    @requestBody({
      content: {},
    })
    order: any,
  ): Promise<any> {
    return this.orderService.create(order);
  }

  @get('/checked-in/{balconyId}/orders')
  @authenticate('firebase')
  @response(200, {
    description: 'Order model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Order, {includeRelations: true}),
      },
    },
  })
  async findCheckInOrders(
    @param.path.string('balconyId') balconyId: string,
  ): Promise<any> {
    const checkInPayload = {
      userId: this.currentUser.id,
      action: 'check-in',
      complete: false,

      role: 'user',
    };

    const checkIn: any = await this.activityRepository.findOne({
      where: checkInPayload,
      order: ['created_at DESC'],
    });

    const openHours: any = await this.placeRepository.getTodayOpeningHours(
      checkIn.placeId,
    );
    const openhour = openHours?.[0].openhour;
    const dayofweek = openHours?.[0].dayofweek;
    const now = new Date();
    const startDate = now;
    if (startDate.getDay() > dayofweek)
      startDate.setDate(startDate.getDate() - 1);
    startDate.setHours(openhour.split(':')[0]);
    startDate.setMinutes(openhour.split(':')[1]);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);

    return this.orderRepository.findAll({
      ...OrderSingleFull,
      where: {
        and: [
          {balconyId: balconyId},
          {userId: this.currentUser.id},
          {created_at: {gte: startDate}},
          {deleted: false},
        ],
      },
      order: 'created_at DESC',
    });
    // Promise all this sff this
    // return this.orderRepository.find({
    //   ...OrderSingleFull,
    //   where: { balconyId, userId: this.currentUser.id },order:'created_at DESC',
    // });
  }
  // /u

  @get('/orders/count')
  @response(200, {
    description: 'Order model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Order) where?: Where<Order>): Promise<Count> {
    return this.orderRepository.count(where);
  }

  @get('/orders')
  @response(200, {
    description: 'Array of Order model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Order, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Order) filter?: Filter<Order>): Promise<Order[]> {
    return this.orderRepository.find(OrderSingleFull);
  }
  @get('/user/orders')
  @authenticate('firebase')
  @response(200, {
    description: 'Array of Order model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Order, {includeRelations: true}),
        },
      },
    },
  })
  async findUserOrders(
    @param.filter(Order) filter?: Filter<Order>,
  ): Promise<Order[]> {
    return this.orderRepository.find({
      where: {userId: this.currentUser.id},
      ...OrderSingleFull,
    });
  }

  @get('/orders/{id}')
  @response(200, {
    description: 'Order model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Order, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Order, {exclude: 'where'})
    filter?: FilterExcludingWhere<Order>,
  ): Promise<Order> {
    return this.orderRepository.findById(id, OrderSingleFull);
  }
  // /update-order-status/"+orderId,

  @patch('/update-order-status/{id}')
  @authenticate('firebase')
  @response(204, {
    description: 'Order PATCH success',
  })
  async updateStatusById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        // "application/json": {
        //   schema: getModelSchemaRef(Order, { partial: true }),
        // },
      },
    })
    data: any,
  ): Promise<void> {
    return this.orderService.updateStatusById(id, data);
  }
  @patch('/orders/{id}')
  @response(204, {
    description: 'Order PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {partial: true}),
        },
      },
    })
    order: Order,
  ): Promise<void> {
    await this.orderRepository.updateById(id, order);
  }

  /*
  @patch('/orders')
  @response(200, {
    description: 'Order PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {partial: true}),
        },
      },
    })
    order: Order,
    @param.where(Order) where?: Where<Order>,
  ): Promise<Count> {
    return this.orderRepository.updateAll(order, where);
  }
  @put('/orders/{id}')
  @response(204, {
    description: 'Order PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() order: Order,
  ): Promise<void> {
    await this.orderRepository.replaceById(id, order);
  }

  @del('/orders/{id}')
  @response(204, {
    description: 'Order DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.orderRepository.deleteById(id);
  }

  */

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
