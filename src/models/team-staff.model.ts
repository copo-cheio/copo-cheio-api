import {model,property} from '@loopback/repository';
import {Base} from './base.model';

@model()
export class TeamStaff extends Base {
  @property.array(String)
  roles?: string[]; // "owner", "admin", "manager", "bar", "door"

  @property({
    type: 'string',
  })
  teamId?: string;

  @property({
    type: 'string',
  })
  staffId?: string;

  constructor(data?: Partial<TeamStaff>) {
    super(data);
  }
}

export interface TeamStaffRelations {
  // describe navigational properties here
}

export type TeamStaffWithRelations = TeamStaff & TeamStaffRelations;
