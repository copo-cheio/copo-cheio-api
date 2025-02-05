import {belongsTo,model} from '@loopback/repository';
import {Base} from './base.model';
import {Playlist} from './playlist.model';
import {Song} from './song.model';

@model()
export class PlaylistSong extends Base {
  @belongsTo(() => Playlist, {name: 'playlist'})
  refId: string;

  @belongsTo(() => Song)
  songId: string;

  constructor(data?: Partial<PlaylistSong>) {
    super(data);
  }
}

export interface PlaylistSongRelations {
  // describe navigational properties here
}

export type PlaylistSongWithRelations = PlaylistSong & PlaylistSongRelations;
