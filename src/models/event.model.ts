import {belongsTo,hasMany,hasOne,model,property,referencesMany} from '@loopback/repository';
import {Address} from './address.model';
import {Base} from './base.model';
import {EventRule} from './event-rule.model';
import {Image} from './image.model';
import {Lineup} from './lineup.model';
import {Place} from './place.model';
import {Playlist} from './playlist.model';
import {Rule} from './rule.model';
import {Schedule} from './schedule.model';

import {ScheduleTypes} from '../blueprints/shared/schedule.include';
import {EventInstance} from './event-instance.model';
import {OpeningHours} from './opening-hours.model';
import {RecurringSchedule} from './recurring-schedule.model';
import {Tag} from './tag.model';
import {Ticket} from './ticket.model';

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
    type: 'string',
    jsonSchema: {
      enum: ScheduleTypes
    },
    default: ScheduleTypes[1]
  })
  type?: string;


  @property({
    type: 'string',
    // required: true,
    default: "none"
  })
  recurrenceType: string; // e.g., 'none', 'daily', 'weekly', 'biweekly'

  @property({
    type: 'date',
  })
  recurrenceEndDate?: string; // Date when the recurrence ends, if applicable

  @property({
    type: 'boolean',
    default: false,
  })
  isRecurring: boolean; // True if recurring, false if one-time event


  @property({
    type: 'string',
    // required: true,
  })
  eventType: string; // e.g. 'concert', 'festival', 'party', etc.


  @property({
    type: 'number',
    required: true,
    default:0
  })
  status: number;
  @property({
    type: 'boolean',

    default:false
  })
  live: boolean;


  @belongsTo(() => Image)
  coverId: string;

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

  @belongsTo(() => Playlist)
  playlistId: string;

  @hasMany(() => Lineup)
  lineups: Lineup[];

  @referencesMany(() => Tag)
  tagIds: string[];


  /* ********************************** */
  @hasMany(() => OpeningHours)
  openingHours: OpeningHours[];

  @hasMany(() => Image, {keyTo: 'refId'})
  gallery: Image[];

  @hasMany(() => EventInstance)
  instances: EventInstance[];

  @hasOne(() => RecurringSchedule)
  recurringSchedule: RecurringSchedule;
  /*         Computed Properties        */
  /* ********************************** */

  @property({
    type: 'date',
  })
  endDate?: Date;



  @property({
    type: 'date',
    // required: true,
  })
  startDate: Date;




  constructor(data?: Partial<Event>) {

    super(data);
  }
}

export interface EventRelations {
  // describe navigational properties here
}

export type EventWithRelations = Event & EventRelations;
