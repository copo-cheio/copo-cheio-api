import {model,property, hasMany} from '@loopback/repository';
import {Base} from './base.model';
import {Song} from './song.model';
import {PlaylistSong} from './playlist-song.model';

@model()
export class Playlist extends Base {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  description?: string;

  @hasMany(() => Song, {through: {model: () => PlaylistSong}})
  songs: Song[];

  constructor(data?: Partial<Playlist>) {
    super(data);
  }
}

export interface PlaylistRelations {
  // describe navigational properties here
}

export type PlaylistWithRelations = Playlist & PlaylistRelations;
