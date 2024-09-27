import {authenticate,AuthenticationBindings} from "@loopback/authentication";
import {inject} from "@loopback/core";
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  IsolationLevel,
  repository,
  Where,
} from "@loopback/repository";
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from "@loopback/rest";
import {UserProfile} from "@loopback/security";
import {v4} from "uuid";
import {OrderSingleFull} from "../blueprints/shared/order.include";
import {Order} from "../models";
import {
  CredentialRepository,
  OrderItemRepository,
  OrderRepository,
  OrderTimelineRepository,
  PriceRepository,
} from "../repositories";
import {PushNotificationService} from "../services";

export class OrderController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
    @repository(OrderTimelineRepository)
    public orderTimelineRepository: OrderTimelineRepository,
    @repository(PriceRepository)
    public priceRepository: PriceRepository,

    @repository(OrderItemRepository)
    public orderItemRepository: OrderItemRepository,
    @inject("services.PushNotificationService")
    private pushNotificationService: PushNotificationService,
    @repository(CredentialRepository)
    public credentialRepository: CredentialRepository,
    @inject(AuthenticationBindings.CURRENT_USER, { optional: true })
    private currentUser: UserProfile // Inject the current user profile
  ) {}

  @post("/orders")
  @authenticate("firebase")
  @response(200, {
    description: "Order model instance",
    content: { "application/json": { schema: getModelSchemaRef(Order) } },
  })
  async create(
    @requestBody({
      content: {},
    })
    order: any
  ): Promise<any> {
    const transaction = await this.orderRepository.dataSource.beginTransaction(
      IsolationLevel.SERIALIZABLE
    );
    try {
      const userId = this.currentUser.id;
      const status = "WAITING_PAYMENT";
      const fees = "0";
      const { menuId, placeId, balconyId, totalPrice, itemCount } = order;
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
      for (let orderItem of order.orderItems) {
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
        currencyId: "bc6635ea-7273-4518-b18a-c066fb300b1f",
      });
      await this.orderRepository.updateById(record.id, {
        priceId: price.id,
      });
      await this.orderTimelineRepository.create({
        orderId: record.id,
        staffId: this.currentUser.id,

        timelineKey: "RECEIVED",
        // staffId: this.currentUser.id,
        action: "RECEIVED",
        title: "RECEIVED",
      });
      await transaction.commit();
      return this.orderRepository.findById(record.id, OrderSingleFull);
    } catch (e) {
      await transaction.rollback();
      console.log(e); // Error: Transaction is rolled back due to timeout
      console.log(e.code); // TRANSACTION_TIMEOUT
      throw new HttpErrors.UnprocessableEntity();
    }
    // Lower-leve
    /**
     * balconyId:string,
itemCount:number,
orderItems: [{
menuProduct,
count,curentPrice,currentTotalPrice,productOptionIds:[]}]

     */
    const record = await this.orderRepository.create(order);
  }

  @get("/checked-in/{balconyId}/orders")
  @authenticate("firebase")
  @response(200, {
    description: "Order model instance",
    content: {
      "application/json": {
        schema: getModelSchemaRef(Order, { includeRelations: true }),
      },
    },
  })
  async findCheckInOrders(
    @param.path.string("balconyId") balconyId: string
  ): Promise<any> {
    return this.orderRepository.find({
      ...OrderSingleFull,
      where: { balconyId, userId: this.currentUser.id },
    });
  }
  // /u

  @get("/orders/count")
  @response(200, {
    description: "Order model count",
    content: { "application/json": { schema: CountSchema } },
  })
  async count(@param.where(Order) where?: Where<Order>): Promise<Count> {
    return this.orderRepository.count(where);
  }

  @get("/orders")
  @response(200, {
    description: "Array of Order model instances",
    content: {
      "application/json": {
        schema: {
          type: "array",
          items: getModelSchemaRef(Order, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(Order) filter?: Filter<Order>): Promise<Order[]> {
    return this.orderRepository.find(OrderSingleFull);
  }
  @get("/user/orders")
  @authenticate("firebase")
  @response(200, {
    description: "Array of Order model instances",
    content: {
      "application/json": {
        schema: {
          type: "array",
          items: getModelSchemaRef(Order, { includeRelations: true }),
        },
      },
    },
  })
  async findUserOrders(
    @param.filter(Order) filter?: Filter<Order>
  ): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId: this.currentUser.id },
      ...OrderSingleFull,
    });
  }

  @patch("/orders")
  @response(200, {
    description: "Order PATCH success count",
    content: { "application/json": { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        "application/json": {
          schema: getModelSchemaRef(Order, { partial: true }),
        },
      },
    })
    order: Order,
    @param.where(Order) where?: Where<Order>
  ): Promise<Count> {
    return this.orderRepository.updateAll(order, where);
  }

  @get("/orders/{id}")
  @response(200, {
    description: "Order model instance",
    content: {
      "application/json": {
        schema: getModelSchemaRef(Order, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.string("id") id: string,
    @param.filter(Order, { exclude: "where" })
    filter?: FilterExcludingWhere<Order>
  ): Promise<Order> {
    return this.orderRepository.findById(id, OrderSingleFull);
  }
  // /update-order-status/"+orderId,

  @patch("/update-order-status/{id}")
  @authenticate("firebase")
  @response(204, {
    description: "Order PATCH success",
  })
  async updateStatusById(
    @param.path.string("id") id: string,
    @requestBody({
      content: {
        // "application/json": {
        //   schema: getModelSchemaRef(Order, { partial: true }),
        // },
      },
    })
    data: any
  ): Promise<void> {
    const transaction = await this.orderRepository.dataSource.beginTransaction(
      IsolationLevel.SERIALIZABLE
    );
    try {

      await this.orderRepository.updateById(id, { status: data.status });
      await this.orderTimelineRepository.create({
        orderId: id,
        timelineKey: data.status,
        staffId: this.currentUser.id,
        action: data.status,
        title: data.status,
      });

      const order = await this.orderRepository.findById(id);

      await transaction.commit();
      const payload: any = {
        notification: {
          title: "Order updated",
          body: "Your order status is now: " + data.status,
        },
      };
      return this.pushNotificationService.notifyUser(order.userId, payload);
    } catch (ex) {
      await transaction.rollback();
      console.warn(ex);
      throw new HttpErrors.UnprocessableEntity();
    }
  }
  @patch("/orders/{id}")
  @response(204, {
    description: "Order PATCH success",
  })
  async updateById(
    @param.path.string("id") id: string,
    @requestBody({
      content: {
        "application/json": {
          schema: getModelSchemaRef(Order, { partial: true }),
        },
      },
    })
    order: Order
  ): Promise<void> {
    await this.orderRepository.updateById(id, order);
  }

  @put("/orders/{id}")
  @response(204, {
    description: "Order PUT success",
  })
  async replaceById(
    @param.path.string("id") id: string,
    @requestBody() order: Order
  ): Promise<void> {
    await this.orderRepository.replaceById(id, order);
  }

  @del("/orders/{id}")
  @response(204, {
    description: "Order DELETE success",
  })
  async deleteById(@param.path.string("id") id: string): Promise<void> {
    await this.orderRepository.deleteById(id);
  }
}
