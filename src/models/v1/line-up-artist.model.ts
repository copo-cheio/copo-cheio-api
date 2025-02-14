import {belongsTo, model, property} from '@loopback/repository';
import {Artist} from './artist.model';
import {Base} from './base.model';
import {Lineup} from './lineup.model';
import {Schedule} from './schedule.model';

@model()
export class LineUpArtist extends Base {
  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @belongsTo(() => Lineup)
  lineupId: string;

  @belongsTo(() => Artist)
  artistId: string;

  @belongsTo(() => Schedule)
  scheduleId: string;

  constructor(data?: Partial<LineUpArtist>) {
    super(data);
  }
}

export interface LineUpArtistRelations {
  // describe navigational properties here
}

export type LineUpArtistWithRelations = LineUpArtist & LineUpArtistRelations;
