import {hasMany, model, property, referencesMany} from '@loopback/repository';
import {Base} from './base.model';
import {PlaylistSong} from './playlist-song.model';
import {Song} from './song.model';
import {Tag} from './tag.model';

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
  @property({
    type: 'string',
  })
  url?: string;

  @hasMany(() => Song, {
    through: {
      model: () => PlaylistSong,
      keyFrom: 'refId',
      keyTo: 'songId',
    },
  })
  songs: Song[];

  // @hasMany(() => Tag, {through: {model: () => TagReferences, keyFrom: 'refId'}})
  // tags: Tag[];

  @referencesMany(() => Tag)
  tagIds: string[];

  constructor(data?: Partial<Playlist>) {
    super(data);
  }
}

export interface PlaylistRelations {
  // describe navigational properties here
}

export type PlaylistWithRelations = Playlist & PlaylistRelations;
