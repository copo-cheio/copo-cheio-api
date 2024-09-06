import {model,property, belongsTo, referencesMany} from '@loopback/repository';
import {Base} from './base.model';
import {Image} from './image.model';
import {Tag} from './tag.model';

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

  @referencesMany(() => Tag)
  tagIds: string[];

  constructor(data?: Partial<Ingredient>) {
    super(data);
  }
}

export interface IngredientRelations {
  // describe navigational properties here
}

export type IngredientWithRelations = Ingredient & IngredientRelations;
