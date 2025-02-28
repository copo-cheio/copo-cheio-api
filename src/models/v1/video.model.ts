import {belongsTo, model, property, referencesMany} from '@loopback/repository';
import {Base, mergeBaseModelConfiguration} from './base.model';
import {Image} from './image.model';
import {Tag} from './tag.model';

@model(mergeBaseModelConfiguration({}))
export class Video extends Base {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'string',
    required: true,
  })
  url: string;

  @referencesMany(() => Tag)
  tagIds: string[];

  @belongsTo(() => Image)
  coverId: string;

  constructor(data?: Partial<Video>) {
    super(data);
  }
}

export interface VideoRelations {
  // describe navigational properties here
}

export type VideoWithRelations = Video & VideoRelations;
