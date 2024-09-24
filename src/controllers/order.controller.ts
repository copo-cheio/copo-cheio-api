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
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from "@loopback/rest";
import {v4} from 'uuid';
import {OrderSingleFull} from "../blueprints/shared/order.include";
import {Order} from "../models";
import {
  OrderItemRepository,
  OrderRepository,
  PriceRepository
} from "../repositories";
import {PushNotificationService} from "../services";

export class OrderController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
    @repository(PriceRepository)
    public priceRepository: PriceRepository,

    @repository(OrderItemRepository)
    public orderItemRepository: OrderItemRepository,
    @inject("services.PushNotificationService")
    private pushNotificationService: PushNotificationService
  ) {}

  @post("/orders")
  @response(200, {
    description: "Order model instance",
    content: { "application/json": { schema: getModelSchemaRef(Order) } },
  })
  async create(
    @requestBody({
      content: {
        // "application/json": {
        //   schema: getModelSchemaRef(Order, {
        //     title: "NewOrder",
        //     exclude: ["id"],
        //   }),
        // },
      },
    })
    order: any
  ): Promise<any> {
    const transaction = await this.orderRepository.dataSource.beginTransaction(
      IsolationLevel.SERIALIZABLE
    );
    try {
      const userId = "6e6fcbef-886c-486e-8e15-f4ac5e234b5c";
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
        code: v4()
      });
      for (let orderItem of order.orderItems || []) {
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
        price:Number(totalPrice),
        currencyId:"bc6635ea-7273-4518-b18a-c066fb300b1f"
      })
      await this.orderRepository.updateById(record.id,{
        priceId: price.id,

      })
      await transaction.commit();
      return this.orderRepository.findById(record.id, OrderSingleFull)
    } catch (e) {
      await transaction.rollback();
      console.log(e); // Error: Transaction is rolled back due to timeout
      console.log(e.code); // TRANSACTION_TIMEOUT

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
  @response(204, {
    description: "Order PATCH success",
  })
  async updateStatusById(
    @param.path.string("id") id: string,
    @requestBody({
      content: {
        "application/json": {
          schema: getModelSchemaRef(Order, { partial: true }),
        },
      },
    })
    data: any
  ): Promise<void> {
    await this.orderRepository.updateById(id, {status:data.status});

    const payload: any = {
      notification: {
        title: "Order updated",
        body: "Your order is now :" + data.status,
      },
    };

    return await this.pushNotificationService.sendPushNotification(
      data.pushNotificationToken,
      payload
    );
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
