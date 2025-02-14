import {belongsTo, model, property} from '@loopback/repository';
import {Base} from './base.model';
import {Ingredient} from './ingredient.model';
import {Product} from './product.model';

@model()
export class ProductIngredient extends Base {
  @property({
    type: 'boolean',
  })
  isOptional: boolean;
  @property({
    type: 'string',
  })
  optionType: string;
  @property({
    type: 'string',
  })
  optionDefaultValue: string;

  @property({
    type: 'number',
    // required: true,
    dataType: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    postgresql: {
      dataType: 'decimal',
      precision: 10, // Total number of digits
      scale: 2, // Number of digits after the decimal point
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

export type ProductIngredientWithRelations = ProductIngredient &
  ProductIngredientRelations;

/*
'ba870db2-c44c-443f-9c86-defd4a2c92fc' , 'ice'
'49d795be-b519-4b45-a166-6b091ab2b027' , 'cola'
'8417adb3-b866-4ed2-b089-0f264f7fff68' , 'Coca cola'
'60d42ca6-9b42-4058-9116-921467994b63' , 'Coca cola' #Energy
'69773989-8900-488e-a190-b0bc84b5826d' , 'Jac'
'a59e6b43-83b1-46c7-9a68-f803689d8972' , 'Whisky'
'ef8f4e91-7b08-477b-8c62-a2b455571d81' , 'Water'
*/

const query = (key: string, value: string) =>
  `insert into translation (code,pt,en,live) values ('${key}','${value}','${key}',true)`;
