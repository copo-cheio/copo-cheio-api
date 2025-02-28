import {belongsTo, model, property, referencesMany} from '@loopback/repository';
import {Base, mergeBaseModelConfiguration} from './base.model';
import {Image} from './image.model';
import {Tag} from './tag.model';

@model(
  mergeBaseModelConfiguration({
    /* settings: {
    indexes: {
      compositeUnique: {
        keys: {
          name: 1,
          description: 1,
        },
        options: {
          unique: true,
        },
      },
    },
  }, */
  }),
)
export class Ingredient extends Base {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
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
