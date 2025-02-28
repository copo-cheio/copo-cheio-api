import {model, property, referencesMany} from '@loopback/repository';
import {Base} from './v1/base.model';
import {Tag} from './tag.model';

@model()
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

  constructor(data?: Partial<Video>) {
    super(data);
  }
}

export interface VideoRelations {
  // describe navigational properties here
}

export type VideoWithRelations = Video & VideoRelations;
