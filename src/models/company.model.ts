import {hasOne,model,property,referencesMany, belongsTo, hasMany} from '@loopback/repository';
import {Base} from './base.model';
import {Contacts} from './contacts.model';
import {Staff} from './staff.model';
import {Image} from './image.model';

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

  @referencesMany(() => Staff)
  staffIds: string[];

  @hasOne(() => Contacts, {keyTo: 'refId'})
  contacts: Contacts;

  @belongsTo(() => Image)
  coverId: string;

  @hasMany(() => Staff)
  staffMembers: Staff[];

  constructor(data?: Partial<Company>) {
    super(data);
  }
}

export interface CompanyRelations {
  // describe navigational properties here
}

export type CompanyWithRelations = Company & CompanyRelations;
