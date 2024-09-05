import {model,property, belongsTo} from '@loopback/repository';
import {Base} from './base.model';
import {Product} from './product.model';
import {Ingredient} from './ingredient.model';

@model()
export class ProductIngredient extends Base {
  @property({
    type: 'boolean',
    required: true,
    default: false
  })
  isOptional: boolean = false;

  @property({
    type: 'number',
    // required: true,
    dataType: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    postgresql: {
      dataType: 'decimal',
      precision: 10,  // Total number of digits
      scale: 2,       // Number of digits after the decimal point
    },
  })
  cost: number;

  @belongsTo(() => Product)
  productId: string;

  @belongsTo(() => Ingredient)
  ingredientId: string;

  constructor(data?: Partial<ProductIngredient>) {
    super(data);
  }
}

export interface ProductIngredientRelations {
  // describe navigational properties here
}

export type ProductIngredientWithRelations = ProductIngredient & ProductIngredientRelations;
