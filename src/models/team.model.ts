import {hasMany,model,property} from '@loopback/repository';
import {Base} from './base.model';
import {Event} from './event.model';
import {Place} from './place.model';
import {Staff} from './staff.model';
import {TeamStaff} from './team-staff.model';

@model()
export class Team extends Base {

  @property({
     type: 'string',
   })
   companyId?: string;

  @property({
    type: 'string',
  })
  name?: string;

  @hasMany(() => Staff, {through: {model: () => TeamStaff}})
  staff: Staff[];

  @hasMany(() => Event)
  events: Event[];

  @hasMany(() => Place)
  places: Place[];

  @hasMany(() => TeamStaff)
  teamStaffs: TeamStaff[];

  constructor(data?: Partial<Team>) {
    super(data);
  }
}

export interface TeamRelations {
  // describe navigational properties here
}

export type TeamWithRelations = Team & TeamRelations;
