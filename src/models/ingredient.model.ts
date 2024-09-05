import {model,property, belongsTo} from '@loopback/repository';
import {Base} from './base.model';
import {Image} from './image.model';

@model()
export class Ingredient extends Base {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string'
  })
  description?: string;

  @belongsTo(() => Image)
  thumbnailId: string;

  constructor(data?: Partial<Ingredient>) {
    super(data);
  }
}

export interface IngredientRelations {
  // describe navigational properties here
}

export type IngredientWithRelations = Ingredient & IngredientRelations;
