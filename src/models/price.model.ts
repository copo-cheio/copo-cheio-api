import {belongsTo,model,property} from '@loopback/repository';
import {Base} from './base.model';
import {Currency} from './currency.model';

@model()
export class Price extends Base {
  @property({
    type: 'number',
    required: true,
  dataType: 'FLOAT'
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
