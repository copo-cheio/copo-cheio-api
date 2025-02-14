import {belongsTo, model, property} from '@loopback/repository';

import {Balcony} from './balcony.model';
import {Base} from './base.model';
import {Ingredient} from './ingredient.model';

@model()
export class Stock extends Base {
  @property({
    type: 'string',
    required: true,
  })
  status: string;

  @belongsTo(() => Balcony)
  balconyId: string;

  @belongsTo(() => Ingredient)
  ingredientId: string;

  constructor(data?: Partial<Stock>) {
    super(data);
  }
}

export interface StockRelations {
  // describe navigational properties here
}

export type StockWithRelations = Stock & StockRelations;
