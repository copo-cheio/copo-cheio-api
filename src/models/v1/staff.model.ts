import {belongsTo,model,property} from '@loopback/repository';
import {Base} from './base.model';
import {Company} from './company.model';
import {User} from './user.model';

@model()
export class Staff extends Base {
  @property({
    type: 'string',
    required: true,
  })
  role: string;

  @property.array(String)
  roles?: string[]; // "owner", "admin", "manager", "bar", "door"

  @belongsTo(() => User)
  userId: string;

  @belongsTo(() => Company)
  companyId: string;

  constructor(data?: Partial<Staff>) {
    super(data);
  }
}

export interface StaffRelations {
  // describe navigational properties here
}

export type StaffWithRelations = Staff & StaffRelations;
