import { model, property, belongsTo} from '@loopback/repository';
import { Base } from './base.model';
import {Artist} from './artist.model';
import {Image} from './image.model';

@model()
export class Song extends Base {
  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'string',
    required: true,
  })
  duration: string;

  @property({
    type: 'string',
  })
  album?: string;

  @property({
    type: 'string',
    required: true,
  })
  url: string;

  @belongsTo(() => Artist)
  artistId: string;

  @belongsTo(() => Image)
  thumbnailId: string;

  constructor(data?: Partial<Song>) {
    super(data);
  }
}

export interface SongRelations {
  // describe navigational properties here
}

export type SongWithRelations = Song & SongRelations;
