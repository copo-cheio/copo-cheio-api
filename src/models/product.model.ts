import {belongsTo,hasMany,model,property,referencesMany} from '@loopback/repository';
import {Base} from './base.model';
import {Image} from './image.model';
import {ProductIngredient} from './product-ingredient.model';
import {Tag} from './tag.model';
import {ProductOption} from './product-option.model';

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

  @property({
    type: 'boolean'
  })
  customizable?: boolean;



  @referencesMany(() => Tag)
  tagIds: string[];

  @belongsTo(() => Image)
  thumbnailId: string;

  @hasMany(() => ProductIngredient)
  ingredients: ProductIngredient[];

  @hasMany(() => ProductOption)
  options: ProductOption[];
  // @hasMany(() => Ingredient, {through: {model: () => ProductIngredient}})
  // ingredients: Ingredient[];

  constructor(data?: Partial<Product>) {
    super(data);
  }
}

export interface ProductRelations {
  // describe navigational properties here
}

export type ProductWithRelations = Product & ProductRelations;
