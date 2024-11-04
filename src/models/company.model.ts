import {belongsTo,hasMany,hasOne,model,property,referencesMany} from '@loopback/repository';
import {Base} from './base.model';
import {Contacts} from './contacts.model';
import {Event} from './event.model';
import {Image} from './image.model';
import {Place} from './place.model';
import {Staff} from './staff.model';
import {Team} from './team.model';

@model()
export class Company extends Base {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  description?: string;

  // @referencesMany(() => Staff)
  // staffIds: string[];

  @hasOne(() => Contacts, {keyTo: 'refId'})
  contacts: Contacts;

  @belongsTo(() => Image)
  coverId: string;

  @hasMany(() => Staff)
  staffMembers: Staff[];

  @hasMany(() => Team)
  teams: Team[];

  @hasMany(() => Event)
  events: Event[];

  @referencesMany(() => Place)
  previousPlaceIds: string[];

  constructor(data?: Partial<Company>) {
    super(data);
  }
}

export interface CompanyRelations {
  // describe navigational properties here
}

export type CompanyWithRelations = Company & CompanyRelations;
