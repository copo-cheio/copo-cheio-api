import {AuthenticationBindings} from '@loopback/authentication';
import { /* inject, */ BindingScope,inject,injectable} from '@loopback/core';
import {IsolationLevel,repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {v4} from 'uuid';
import {OrderSingleFull} from '../blueprints/shared/order.include';
import {ORDER_COMPLETE_STATUS,ORDER_READY_STATUS,ORDER_STATUS} from '../models';
import {CredentialRepository,ImageRepository,OrderItemRepository,OrderRepository,OrderTimelineRepository,PriceRepository} from '../repositories';
import {PUSH_NOTIFICATION_SUBSCRIPTIONS,PushNotificationService} from './push-notification.service';
import {QrFactoryService} from './qr-factory.service';

@injectable({scope: BindingScope.TRANSIENT})
export class OrderService {
  constructor(/* Add @inject to inject parameters */
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
    @repository(OrderTimelineRepository)
    public orderTimelineRepository: OrderTimelineRepository,
    @repository(PriceRepository)
    public priceRepository: PriceRepository,
    @repository(ImageRepository)
    public imageRepository: ImageRepository,
    @repository(OrderItemRepository)
    public orderItemRepository: OrderItemRepository,
    @inject("services.PushNotificationService")
    private pushNotificationService: PushNotificationService,
    @inject("services.QrFactoryService")
    protected qrFactoryService: QrFactoryService,
    @repository(CredentialRepository)
    public credentialRepository: CredentialRepository,
    @inject(AuthenticationBindings.CURRENT_USER, { optional: true })
    private currentUser: UserProfile // Inject the current user profile

  ) {}

  /*
   * Add service methods here
   */
  async updateStatusById(id:string,data:any ={}){
    const transaction = await this.orderRepository.dataSource.beginTransaction(
      IsolationLevel.SERIALIZABLE
    );
    try {
      let orderPayload: any = {
        status: data.status,
      };
      if (data.status == ORDER_READY_STATUS) {
        let record = await this.orderRepository.findById(id);
        let image = await this.imageRepository.findOne({
          where: {
            refId: id,
            type: "qr",
          },
        });
        if (!image) {
          const qrRecord = await this.qrFactoryService.generateAndUploadQrCode(
            {
              action: "VALIDATE_ORDER",
              type: "order",
              code: record.code,
              refId: id,
            },
            id,
            "order"
          );
          image = await this.imageRepository.findOne({
            where: {
              refId: id,
              type: "qr",
            },
          });
        }
        if (image) {
          await this.imageRepository.updateById(image?.id, {
            orderId: id,
          });
        }
      }
      await this.orderRepository.updateById(id, { status: data.status });
      await this.orderTimelineRepository.create({
        orderId: id,
        timelineKey: data.status,
        staffId: this.currentUser.id,
        action: data.status,
        title: data.status,
      });

      // const order: any = await this.orderRepository.findOne({
      //   ...OrderSingleFull,
      //   where: { id: id },
      // });


      const _order = await this.notifyOrderStatusUpdate(id)
      await transaction.commit();


      return _order;
    } catch (ex) {
      await transaction.rollback();
      console.warn(ex);
      throw new HttpErrors.UnprocessableEntity();
    }
  }

  async validateOrder(

    qr: any
  ): Promise<any> {
    const transaction = await this.orderRepository.dataSource.beginTransaction(
      IsolationLevel.SERIALIZABLE
    );
    const code = qr.code;
    const type = "qr";
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
        if(!order){
          throw new Error("ORDER_NOT_FOUND")
        }


        if (order?.status !== ORDER_READY_STATUS) {
          const index = ORDER_STATUS.indexOf(order?.status || "");
          throw new Error(
            index > (ORDER_STATUS.indexOf(ORDER_READY_STATUS) - 1)
              ? "QR_USED"
              : "QR_INVALID"
          );
        }else {
          await this.orderRepository.updateById(refId, {
            status: ORDER_COMPLETE_STATUS
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
            success:true,
            order
          }
        }
      } else {
        throw new Error("QR_NOT_FOUND");
      }
    } catch (e) {
      await transaction.rollback();
      console.log(e); // Error: Transaction is rolled back due to timeout
      console.log(e.code); // TRANSACTION_TIMEOUT


      let order:any = await this.orderRepository.findById(refId,OrderSingleFull);
      order = order? order.toJSON(): {}
      if (e.message == "QR_NOT_FOUND") {
        throw new HttpErrors.NotFound();
      } else if (e.message == "QR_USED") {
         // throw new HttpErrors.UpgradeRequired();
         return {
           success:false,
           reason: "CODE_USED_BEFORE",
           order: order
         }
        // throw new HttpErrors.NotAcceptable();
      } else if (e.message == "QR_INVALID") {


        // throw new HttpErrors.UpgradeRequired();
        const order = await this.orderRepository.findById(refId,OrderSingleFull);
        return {
          success:false,
          reason: "CODE_NOT_READY",
          order: order
        }
      } else {
        // throw new HttpErrors.UnprocessableEntity();
          // throw new HttpErrors.UpgradeRequired();
          const order = await this.orderRepository.findById(refId,OrderSingleFull);
          return {
            success:false,
            reason: "ORDER_NOT_FOUND",
            order: order
          }
      }
    }
  }

  async create(order:any){
  const transaction = await this.orderRepository.dataSource.beginTransaction(
    IsolationLevel.SERIALIZABLE
  );
  try {
    const userId = this.currentUser.id;
    const status = ORDER_STATUS[0];
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
    // return this.orderRepository.findById(record.id, OrderSingleFull);
    // await this.pushNotificationService.sendTopicNotification(PUSH_NOTIFICATION_SUBSCRIPTIONS.checkIn.staff[1](placeId,"",balconyId), {
    //   action: "NEW_ORDER",
    //   payload: {
    //     id: record.id
    //   }
    // })
    return this.orderRepository.findOne({
      ...OrderSingleFull,
      where: { id: record.id },
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
  async notifyOrderStatusUpdate(id:string){
    const order: any = await this.orderRepository.findOne({
      ...OrderSingleFull,
      where: { id: id },
    });

    const notification = {
      title: "Order updated",
      body: "Your order status is now: " + order.status
    };
    let _order = order.toJSON();
    const payload = {
      id: _order.id,
      qr: _order?.qr?.url,
      place: _order.placeId,
      balcony: _order.balconyId,
    };

    let action = order?.status == ORDER_READY_STATUS ? "ORDER_READY":
      order?.status == ORDER_COMPLETE_STATUS ? "ORDER_COMPLETE":
      "OPEN_ORDER"
    const notificationData = {
      action:action,
      payload: payload,
    };

    await this.pushNotificationService.notifyUser(
      order.userId,
      notification,
      notificationData
    );

    if(ORDER_STATUS.indexOf(order.status) > ORDER_STATUS.indexOf("ONHOLD")){

      await this.pushNotificationService.sendTopicNotification(PUSH_NOTIFICATION_SUBSCRIPTIONS.checkIn.staff[0](_order.placeId,"",_order.balconyId), {
        action: "ORDER_UPDATED",
        payload: {
          id: id,
          status: order.status
        }
      })
    }


    return order;
  }
}
