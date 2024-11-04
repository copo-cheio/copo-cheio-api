import {model,property, hasMany} from '@loopback/repository';
import {Base} from './base.model';
import {Staff} from './staff.model';
import {TeamStaff} from './team-staff.model';

@model()
export class Team extends Base {

  @property({
    type: 'string',
  })
  companyId?: string;

  @hasMany(() => Staff, {through: {model: () => TeamStaff}})
  staff: Staff[];

  constructor(data?: Partial<Team>) {
    super(data);
  }
}

export interface TeamRelations {
  // describe navigational properties here
}

export type TeamWithRelations = Team & TeamRelations;
