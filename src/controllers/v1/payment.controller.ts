// src/controllers/payment.controller.ts
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param, post, requestBody} from '@loopback/rest';
import {CartItem} from '../../models/v1';
import {OrderRepository} from '../../repositories/v1';
import {StripeService} from '../../services/stripe.service';

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
  async find(@param.path.string('id') id: string): Promise<any> {
    const order = await this.orderRepository.findById(id);

    return order;
    // return this.orderRepository.cartItems(id).find(filter);
  }

  @post('/create-payment-intent', {
    responses: {
      '200': {
        description: 'Payment Intent',
        content: {'application/json': {schema: {'x-ts-type': Object}}},
      },
    },
  })
  async createPaymentIntent(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              orderId: {type: 'string'},
              // currency: { type: 'string' },
              amount: {type: 'string'},
              currency: {type: 'string'},
              // currency: { type: 'string' },
            },
            required: ['orderId', 'amount', 'currency'],
          },
        },
      },
    })
    data: any,
  ): Promise<any> {
    const paymentIntent: any = this.stripeService.createPaymentIntent(
      data.amount,
      data.currency,
      // You can also add additional parameters here, such as a customer ID or payment method ID
      // metadata: { integration_check: 'accept_a_payment' },,
    );
    // Create order payment intent to do later
    return paymentIntent;

    //  return paymentIntent;
  }
}
