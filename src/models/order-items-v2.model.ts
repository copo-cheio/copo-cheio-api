import {belongsTo, model, property, referencesMany} from '@loopback/repository';
import {MenuProduct} from './v1/menu-product.model';
/* import {OrderItemOptionsV2} from './order-item-options-v2.model'; */
import {Base} from './v1/base.model';
import {ProductOption} from './v1/product-option.model';

@model()
export class OrderItemsV2 extends Base {
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
  basePrice: number;

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
  calculatedPrice: number;

  @property({
    type: 'string',
  })
  orderV2Id?: string;

  /*   @hasMany(() => OrderItemOptionsV2)
  optionsV2: OrderItemOptionsV2[]; */

  @belongsTo(() => MenuProduct)
  menuProductId: string;

  @referencesMany(() => ProductOption)
  optionIds: string[];

  constructor(data?: Partial<OrderItemsV2>) {
    super(data);
  }
}

export interface OrderItemsV2Relations {
  // describe navigational properties here
}

export type OrderItemsV2WithRelations = OrderItemsV2 & OrderItemsV2Relations;
