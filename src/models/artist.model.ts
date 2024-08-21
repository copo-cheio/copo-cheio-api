import {hasMany,model,property, belongsTo} from '@loopback/repository';
import {Base} from './base.model';
import {TagReferences} from './tag-references.model';
import {Tag} from './tag.model';
import {Playlist} from './playlist.model';
import {Image} from './image.model';

@model()
export class Artist extends Base {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  url: string;

  @hasMany(() => Tag, {through: {model: () => TagReferences, keyFrom: 'refId'}})
  tags: Tag[];

  @belongsTo(() => Playlist)
  playlistId: string;

  @belongsTo(() => Image)
  coverId: string;

  constructor(data?: Partial<Artist>) {
    super(data);
  }
}

export interface ArtistRelations {
  // describe navigational properties here
}

export type ArtistWithRelations = Artist & ArtistRelations;
