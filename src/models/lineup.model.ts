import {belongsTo,hasMany,model,property} from '@loopback/repository';
import {Base} from './base.model';
import {Event} from './event.model';
import {LineUpArtist} from './line-up-artist.model';

@model()
export class Lineup extends Base {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @hasMany(() => LineUpArtist)
  lineUpArtists: LineUpArtist[];

  @belongsTo(() => Event)
  eventId: string;

  constructor(data?: Partial<Lineup>) {
    super(data);
  }
}

export interface LineupRelations {
  // describe navigational properties here
}

export type LineupWithRelations = Lineup & LineupRelations;
