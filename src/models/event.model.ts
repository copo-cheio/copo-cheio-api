import {belongsTo,hasMany,model,property} from '@loopback/repository';
import {Base} from './base.model';
import {Image} from './image.model';
import {TagReferences} from './tag-relations.model';
import {Tag} from './tag.model';
import {Address} from './address.model';
import {Place} from './place.model';
import {Schedule} from './schedule.model';
import {Ticket} from './ticket.model';
import {Rule} from './rule.model';
import {EventRule} from './event-rule.model';

@model()
export class Event extends Base {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'string',
  })
  email?: string;

  @property({
    type: 'string',
  })
  webpage?: string;

  @property({
    type: 'number',
    required: true,
  })
  status: number;

  @belongsTo(() => Image)
  coverId: string;

  @hasMany(() => Tag, {through: {model: () => TagReferences, keyFrom: 'refId'}})
  tags: Tag[];

  @belongsTo(() => Address)
  addressId: string;

  @belongsTo(() => Place)
  placeId: string;

  @belongsTo(() => Schedule)
  scheduleId: string;

  @hasMany(() => Ticket, {keyTo: 'refId'})
  tickets: Ticket[];

  @hasMany(() => Rule, {through: {model: () => EventRule}})
  rules: Rule[];

  constructor(data?: Partial<Event>) {
    super(data);
  }
}

export interface EventRelations {
  // describe navigational properties here
}

export type EventWithRelations = Event & EventRelations;
