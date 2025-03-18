import {belongsTo, model, property} from '@loopback/repository';
import {Base} from './base.model';
import {Ingredient} from './ingredient.model';
import {Price} from './price.model';
import {Product} from './product.model';

@model()
export class ProductOption extends Base {
  @property({
    type: 'string',
    required: true,
  })
  group: string;

  @property({
    type: 'boolean',
    required: false,
    default: false,
  })
  includedByDefault: boolean;

  @property({
    type: 'boolean',
    required: false,
    default: false,
  })
  multiple: boolean;

  @belongsTo(() => Product)
  productId: string;

  @belongsTo(() => Ingredient)
  ingredientId: string;

  @belongsTo(() => Price)
  priceId: string;

  constructor(data?: Partial<ProductOption>) {
    super(data);
  }
}

export interface ProductOptionRelations {
  // describe navigational properties here
}

export type ProductOptionWithRelations = ProductOption & ProductOptionRelations;
