import {belongsTo, model, property} from '@loopback/repository';
import {OrderV2} from './order-v2.model';
import {Balcony} from './v1/balcony.model';
import {Base, mergeBaseModelConfiguration} from './v1/base.model';
import {Event} from './v1/event.model';
import {PlaceInstance} from './v1/place-instance.model';
import {Place} from './v1/place.model';
import {User} from './v1/user.model';

@model(
  mergeBaseModelConfiguration({
    settings: {
      indexes: {
        uniqueUserCheckInByApp: {
          keys: {
            app: 1, // Index on customerId
            userId: 1, // Index on productId
          },
          options: {unique: true}, // Enforce uniqueness
        },
      },
    },
  }),
)
export class CheckInV2 extends Base {
  @property({
    type: 'string',
    required: true,
  })
  app: string;

  @property({
    type: 'string',
    default: 'user',
  })
  role?: string;

  @property({
    type: 'string',
    default: 'place',
  })
  type?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  active?: boolean;

  @property({
    type: 'date',
    required: false,
  })
  expiresAt: string;

  @belongsTo(() => User)
  userId: string;

  @belongsTo(() => Balcony)
  balconyId: string;

  @belongsTo(() => Event)
  eventId: string;

  @belongsTo(() => Place)
  placeId: string;

  @belongsTo(() => OrderV2)
  orderV2Id: string;

  @belongsTo(() => PlaceInstance)
  placeInstanceId: string;

  constructor(data?: Partial<CheckInV2>) {
    super(data);
  }
}

export interface CheckInV2Relations {
  // describe navigational properties here
}

export type CheckInV2WithRelations = CheckInV2 & CheckInV2Relations;
