import {belongsTo,model,property,referencesMany} from '@loopback/repository';
import {Base} from './v1/base.model';
import {Tag} from './v1/tag.model';
import {User} from './v1/user.model';

@model()
export class ActivityV2 extends Base {
  @property({
    type: 'string',
    required: true,
  })
  app: string;

  @property({
    type: 'string',
    required: true,
  })
  action: string;

  @property({
    type: 'string',
  })
  referenceId?: string;

  @property({
    type: 'string',
  })
  keyword?: string;

  @belongsTo(() => User)
  userId: string;

  @referencesMany(() => Tag)
  tagIds: string[];

  @property({
    type: 'number',
    required: false,
    postgresql: {
      dataType: 'NUMERIC', // Explicitly specify NUMERIC
      precision: 10, // Total number of digits
      scale: 2, // Number of digits after the decimal point
      default: 0, // Default value of 0 in PostgreSQL
    },
  })
  latitude: number;

  @property({
    type: 'number',
    required: false,
    postgresql: {
      dataType: 'NUMERIC', // Explicitly specify NUMERIC
      precision: 10, // Total number of digits
      scale: 2, // Number of digits after the decimal point
      default: 0, // Default value of 0 in PostgreSQL
    },
  })
  longitude: number;

  constructor(data?: Partial<ActivityV2>) {
    super(data);
    this.tagIds = data?.tagIds ?? [];
  }
}

export interface ActivityV2Relations {
  // describe navigational properties here
}

export type ActivityV2WithRelations = ActivityV2 & ActivityV2Relations;
