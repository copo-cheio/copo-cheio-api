import {belongsTo,model,property,referencesMany, hasMany} from '@loopback/repository';
import {Base} from './base.model';
import {Image} from './image.model';
import {Tag} from './tag.model';
import {Ingredient} from './ingredient.model';
import {ProductIngredient} from './product-ingredient.model';

@model()
export class Product extends Base {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  name?: string;

  @property({
    type: 'string'
  })
  description?: string;



  @referencesMany(() => Tag)
  tagIds: string[];

  @belongsTo(() => Image)
  thumbnailId: string;

  @hasMany(() => Ingredient, {through: {model: () => ProductIngredient}})
  ingredients: Ingredient[];

  constructor(data?: Partial<Product>) {
    super(data);
  }
}

export interface ProductRelations {
  // describe navigational properties here
}

export type ProductWithRelations = Product & ProductRelations;
