import {belongsTo,hasMany,model,property,referencesMany} from '@loopback/repository';
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
import {Tag} from './tag.model';
import {Ticket} from './ticket.model';
import {OpeningHours} from './opening-hours.model';

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
  /*         Computed Properties        */
  /* ********************************** */

  @property({
    type: 'date',
  })
  endDate: Date;




  constructor(data?: Partial<Event>) {

    super(data);
  }
}

export interface EventRelations {
  // describe navigational properties here
}

export type EventWithRelations = Event & EventRelations;
