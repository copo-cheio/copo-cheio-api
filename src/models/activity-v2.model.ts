import {belongsTo, model, property, referencesMany} from '@loopback/repository';
import {Tag} from './tag.model';
import {Base} from './v1/base.model';
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

  @belongsTo(() => User)
  userId: string;

  @referencesMany(() => Tag)
  tagIds: string[];

  constructor(data?: Partial<ActivityV2>) {
    super(data);
  }
}

export interface ActivityV2Relations {
  // describe navigational properties here
}

export type ActivityV2WithRelations = ActivityV2 & ActivityV2Relations;
