import {belongsTo, model, property} from '@loopback/repository';
import {Base, mergeBaseModelConfiguration} from './base.model';
import {Translation} from './translation.model';

@model(
  mergeBaseModelConfiguration({
    /*   settings: {
    indexes: {
      compositeUnique: {
        keys: {
          type: 1,
          name: 1,
        },
        options: {
          unique: true,
        },
      },
    },
  }, */
  }),
)
export class Tag extends Base {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @belongsTo(() => Translation)
  translationId: string;

  // @hasMany(() => Event, {through: {model: () => TagReferences, keyTo: 'refId'}})
  // events: Event[];

  constructor(data?: Partial<Tag>) {
    super(data);
  }
}

export interface TagRelations {
  // describe navigational properties here
}

export type TagWithRelations = Tag & TagRelations;
