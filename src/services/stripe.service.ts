import { /* inject, */ BindingScope,injectable} from '@loopback/core';
import Stripe from 'stripe';
// import { Stripe } from 'stripe';
// import {CreatePaymentIntentDTO, CreateSetupIntentDTO} from './payment-intent.dto';


@injectable({ scope: BindingScope.TRANSIENT })
export class StripeService {
  private stripe: Stripe;

  constructor() {
    console.log({env:process.env.NX_STRIPE_PK})
    this.stripe = new Stripe("sk_test_51MmARtKzMYim9cy3l0jRblHOagmulcxNgJpXRLB3yDDyObnep8C5Eo70FrT5oDJr60G3CPAqdLVHagSyXizvk0ko00645CTaT5", {
      apiVersion: '2024-06-20',
    });
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
}
