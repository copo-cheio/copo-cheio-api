import {belongsTo,model,property,referencesMany} from '@loopback/repository';
import {Base} from './base.model';
import {MenuProduct} from './menu-product.model';
import {ProductOption} from './product-option.model';

@model()
export class OrderItem extends Base {

  @property({
    type: 'string',
  })
  orderId?: string;

  @belongsTo(() => MenuProduct)
  menuProductId: string;

  @referencesMany(() => ProductOption)
  productOptionIds: string[];

  constructor(data?: Partial<OrderItem>) {
    super(data);
  }
}

export interface OrderItemRelations {
  // describe navigational properties here
}

export type OrderItemWithRelations = OrderItem & OrderItemRelations;
