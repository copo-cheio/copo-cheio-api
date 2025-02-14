import {belongsTo, model, property} from '@loopback/repository';
import {Base} from './base.model';
import {Translation} from './translation.model';

/**
 * [
  {
    "id": "0e31d3b8-68cb-431e-92dc-8c98b4e60303",
    "created_at": "2024-08-21T21:03:25.782Z",
    "updated_at": "2024-08-21T21:03:25.782Z",
    "name": "rock",
    "type": "music"
  },
  {
    "id": "537c613c-a58f-4dc4-af13-7dceec03eb82",
    "created_at": "2024-08-21T21:03:42.788Z",
    "updated_at": "2024-08-21T21:03:42.788Z",
    "name": "darts",
    "type": "activity"
  },
  {
    "id": "67144d34-6a14-4ea2-9bfa-490d5cc6c705",
    "created_at": "2024-08-21T21:03:22.176Z",
    "updated_at": "2024-08-21T21:03:22.176Z",
    "name": "techno",
    "type": "music"
  },
  {
    "id": "6a46acd6-ffbe-4053-9d9f-2b1e066cc9c4",
    "created_at": "2024-08-21T21:03:16.610Z",
    "updated_at": "2024-08-21T21:03:16.610Z",
    "name": "house",
    "type": "music"
  },
  {
    "id": "89c96c03-5915-4d26-a149-26090a0f79a7",
    "created_at": "2024-08-21T21:03:08.561Z",
    "updated_at": "2024-08-21T21:03:08.561Z",
    "name": "club",
    "type": "venue"
  },
  {
    "id": "c64d4bb0-7439-4538-b0d7-a6d789add451",
    "created_at": "2024-08-21T21:04:00.074Z",
    "updated_at": "2024-08-21T21:04:00.074Z",
    "name": "happy hour",
    "type": "promotion"
  },
  {
    "id": "e443e5b4-e5e3-4669-ae45-eb8a1cd9ab8d",
    "created_at": "2024-08-21T21:03:48.671Z",
    "updated_at": "2024-08-21T21:03:48.671Z",
    "name": "snooker",
    "type": "activity"
  },
  {
    "id": "f0a6d1ac-9669-40a4-9232-80489563aaff",
    "created_at": "2024-08-21T21:03:04.736Z",
    "updated_at": "2024-08-21T21:03:04.736Z",
    "name": "bar",
    "type": "venue"
  }
]
 */
@model({
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
})
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
