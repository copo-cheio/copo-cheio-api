import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import Stripe from 'stripe';
// import { Stripe } from 'stripe';
// import {CreatePaymentIntentDTO, CreateSetupIntentDTO} from './payment-intent.dto';

// RENDER ORIGINAL PK -> pk_test_51MmARtKzMYim9cy3tOI5vOdHbai4G26V1AiDJmiE4aiAXc8BaSzh9Z0b0f8Novn0Jyyi8JqNdzLzcI2rUGT4g8ct00gfUVdLuM
// RENDER ORIGINAL SK -> sk_test_51MmARtKzMYim9cy3l0jRblHOagmulcxNgJpXRLB3yDDyObnep8C5Eo70FrT5oDJr60G3CPAqdLVHagSyXizvk0ko00645CTaT5

@injectable({scope: BindingScope.TRANSIENT})
export class StripeService {
  private stripe: Stripe;

  constructor() {
    /*  console.log({env: process.env.NX_STRIPE_PK}); */
    this.stripe = new Stripe(
      'sk_test_51Ci6rQJ0PHt1NCdHiYVuTTkN2ZvcUCGN3AoxC5PmntaIzfaqg5II9rBpUAuCJZ30ohmmXFXstnu3Qt6gSOFmzMgT00JCULOiYK',
      //'sk_test_51MmARtKzMYim9cy3l0jRblHOagmulcxNgJpXRLB3yDDyObnep8C5Eo70FrT5oDJr60G3CPAqdLVHagSyXizvk0ko00645CTaT5',
      {
        /*       apiVersion: '2024-06-20', */
        apiVersion: '2025-01-27.acacia',
      },
    );
  }

  // Create a payment intent for a given amount and currency
  async createPaymentIntent(amount: number, currency: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount, // in the smallest currency unit, e.g. cents for USD
        currency,
      });
      return paymentIntent;
    } catch (error) {
      throw error;
    }
  }
  async createPaymentIntentV2(createPaymentIntentDto: any = {}) {
    const customerId = await (async () => {
      if (createPaymentIntentDto.customer_id)
        return createPaymentIntentDto.customer_id;
      const customer = await this.stripe.customers.create();
      return customer.id;
    })();
    const ephemeralKey = await this.stripe.ephemeralKeys.create(
      {customer: customerId},
      {apiVersion: '2020-08-27'},
    );
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: createPaymentIntentDto.amount || 1099,
      currency: createPaymentIntentDto.currency || 'usd',
      customer: customerId,
    });
    return {
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customerId,
    };
  }
}
