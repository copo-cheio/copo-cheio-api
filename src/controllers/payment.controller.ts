// src/controllers/payment.controller.ts
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {get,getModelSchemaRef,param} from '@loopback/rest';
import {CartItem} from '../models';
import {OrderRepository} from '../repositories';
import {StripeService} from '../services/stripe.service';

export class PaymentController {
  constructor(
    @inject('services.StripeService')
    private stripeService: StripeService,
    @repository(OrderRepository) protected orderRepository: OrderRepository,
  ) {}


  @get('/create-payment-intent/{id}', {
    responses: {
      '200': {
        description: 'Array of Order has many CartItem',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(CartItem)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string
  ): Promise<any> {
    const order = await this.orderRepository.findById(id);
    return order
    // return this.orderRepository.cartItems(id).find(filter);
  }

  // @post('/create-payment-intent', {
  //   responses: {
  //     '200': {
  //       description: 'Payment Intent',
  //       content: { 'application/json': { schema: { 'x-ts-type': Object } } },
  //     },
  //   },
  // })
  // async createPaymentIntent(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: {
  //           type: 'object',
  //           properties: {
  //             orderId: { type: 'string' },
  //             // currency: { type: 'string' },
  //           },
  //           required: ['orderId', 'currency'],
  //         },
  //       },
  //     },
  //   })
  //   paymentDetails: { orderId: string },
  // ) {
    @get('/test/create-payment-intent', {
      responses: {
        '200': {
          description: 'Test payment intente',
        },
      },
    })
    async createTestPaymentIntent(){
     const paymentIntent = await this.stripeService.createPaymentIntent(
       1050,
       "EUR",
     );
     return paymentIntent;

   }
}
