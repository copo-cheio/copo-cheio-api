import {model,property, belongsTo} from '@loopback/repository';
import {Base} from './base.model';
import {Playlist} from './playlist.model';

@model()
export class TimeTable extends Base {
  @property({
    type: 'string',
    required: true,
  })
  from: string;

  @property({
    type: 'string',
  })
  to?: string;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'string',
  })
  lineupId?: string;

  @belongsTo(() => Playlist)
  playlistId: string;

  constructor(data?: Partial<TimeTable>) {
    super(data);
  }
}

export interface TimeTableRelations {
  // describe navigational properties here
}

export type TimeTableWithRelations = TimeTable & TimeTableRelations;
