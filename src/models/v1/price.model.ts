import {belongsTo, model, property} from '@loopback/repository';

import {Base} from './base.model';
import {Currency} from './currency.model';

@model()
export class Price extends Base {
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
  price: number;

  @belongsTo(() => Currency)
  currencyId: string;

  constructor(data?: Partial<Price>) {
    super(data);
  }
}

export interface PriceRelations {
  // describe navigational properties here
}

export type PriceWithRelations = Price & PriceRelations;
