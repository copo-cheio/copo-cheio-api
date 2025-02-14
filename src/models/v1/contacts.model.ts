import {model, property} from '@loopback/repository';
import {Base} from './base.model';

@model()
export class Contacts extends Base {
  @property({
    type: 'string',
  })
  email?: string;

  @property({
    type: 'string',
  })
  phone?: string;

  @property({
    type: 'string',
  })
  website?: string;

  @property({
    type: 'string',
  })
  social_facebook?: string;

  @property({
    type: 'string',
  })
  social_instagram?: string;

  @property({
    type: 'string',
  })
  social_threads?: string;

  @property({
    type: 'string',
  })
  refId?: string;

  constructor(data?: Partial<Contacts>) {
    super(data);
  }
}

export interface ContactsRelations {
  // describe navigational properties here
}

export type ContactsWithRelations = Contacts & ContactsRelations;
