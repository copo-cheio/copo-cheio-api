import {model,property} from '@loopback/repository';
import {Base} from './base.model';

@model()
export class PlaylistSong extends Base {

  @property({
    type: 'string',
  })
  playlistId?: string;

  @property({
    type: 'string',
  })
  songId?: string;

  constructor(data?: Partial<PlaylistSong>) {
    super(data);
  }
}

export interface PlaylistSongRelations {
  // describe navigational properties here
}

export type PlaylistSongWithRelations = PlaylistSong & PlaylistSongRelations;
