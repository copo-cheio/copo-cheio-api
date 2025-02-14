import {belongsTo, hasMany, model, property} from '@loopback/repository';
import {Base} from './base.model';
import {Event} from './event.model';
import {Image} from './image.model';
import {Place} from './place.model';
import {Staff} from './staff.model';
import {TeamStaff} from './team-staff.model';

@model()
export class Team extends Base {
  @property({
    type: 'string',
    required: true,
  })
  companyId?: string;

  @property({
    type: 'string',
    required: true,
  })
  name?: string;
  @property({
    type: 'string',
  })
  description?: string;

  @hasMany(() => Staff, {through: {model: () => TeamStaff}})
  staff: Staff[];

  @hasMany(() => Event)
  events: Event[];

  @hasMany(() => Place)
  places: Place[];

  @hasMany(() => TeamStaff)
  teamStaffs: TeamStaff[];

  @belongsTo(() => Image)
  coverId: string;

  constructor(data?: Partial<Team>) {
    super(data);
  }
}

export interface TeamRelations {
  // describe navigational properties here
}

export type TeamWithRelations = Team & TeamRelations;
