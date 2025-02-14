import {belongsTo, model, property, referencesMany} from '@loopback/repository';
import {Base} from './base.model';
import {MenuProduct} from './menu-product.model';
import {ProductOption} from './product-option.model';

@model()
export class OrderItem extends Base {
  @property({
    type: 'string',
  })
  orderId?: string;

  @property({
    type: 'number',
  })
  count?: number;
  @property({
    type: 'number', // Use 'number' for NUMERIC/DECIMAL types in LoopBack

    postgresql: {
      dataType: 'NUMERIC', // Explicitly specify NUMERIC
      precision: 10, // Total number of digits
      scale: 2, // Number of digits after the decimal point
      default: 0, // Default value of 0 in PostgreSQL
    },
    jsonSchema: {
      minimum: 0, // Set minimum value to 0
    },
  })
  currentPrice: number;
  @property({
    type: 'number', // Use 'number' for NUMERIC/DECIMAL types in LoopBack

    postgresql: {
      dataType: 'NUMERIC', // Explicitly specify NUMERIC
      precision: 10, // Total number of digits
      scale: 2, // Number of digits after the decimal point
      default: 0, // Default value of 0 in PostgreSQL
    },
    jsonSchema: {
      minimum: 0, // Set minimum value to 0
    },
  })
  totalPrice: number;

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
