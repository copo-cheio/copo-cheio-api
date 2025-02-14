/* import {model, property} from '@loopback/repository';
import {Base} from './v1/base.model';

@model()
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

  constructor(data?: Partial<CheckInV2>) {
    super(data);
  }
}

export interface CheckInV2Relations {
  // describe navigational properties here
}

export type CheckInV2WithRelations = CheckInV2 & CheckInV2Relations;
 */
