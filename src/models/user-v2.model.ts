/* import {model, property} from '@loopback/repository';
import {Base} from './v1/base.model';

@model()
export class UserV2 extends Base {
  @property({
    type: 'string',
    required: true,
  })
  uid: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  displayName: string;

  @property({
    type: 'string',
    required: true,
  })
  photoUrl: string;

  @property({
    type: 'string',
  })
  accessToken?: string;

  @property({
    type: 'string',
  })
  pushNotificationToken?: string;

  constructor(data?: Partial<UserV2>) {
    super(data);
  }
}

export interface UserV2Relations {
  // describe navigational properties here
}

export type UserV2WithRelations = UserV2 & UserV2Relations;
 */
