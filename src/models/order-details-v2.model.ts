import {belongsTo, model, property} from '@loopback/repository';
import {OrderV2} from './order-v2.model';
import {Base} from './v1/base.model';

@model()
export class OrderDetailsV2 extends Base {
  @property({
    type: 'number',
    required: true,
  })
  productCount: number;

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
  productsPrice: number;

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
  serviceFee: number;

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

  @belongsTo(() => OrderV2)
  orderV2Id: string;

  constructor(data?: Partial<OrderDetailsV2>) {
    super(data);
  }
}

export interface OrderDetailsV2Relations {
  // describe navigational properties here
}

export type OrderDetailsV2WithRelations = OrderDetailsV2 &
  OrderDetailsV2Relations;
