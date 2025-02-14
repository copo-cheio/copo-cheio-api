import {belongsTo, model, property} from '@loopback/repository';
import {Base} from './base.model';
import {Staff} from './staff.model';

@model()
export class TeamStaff extends Base {
  @property.array(String)
  roles?: string[]; // "owner", "admin", "manager", "bar", "door"

  @property({
    type: 'string',
  })
  teamId?: string;

  @belongsTo(() => Staff)
  staffId: string;

  constructor(data?: Partial<TeamStaff>) {
    super(data);
  }
}

export interface TeamStaffRelations {
  // describe navigational properties here
}

export type TeamStaffWithRelations = TeamStaff & TeamStaffRelations;
