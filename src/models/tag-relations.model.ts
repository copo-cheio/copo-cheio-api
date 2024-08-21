import {model,property} from '@loopback/repository';
import {Base} from './base.model';

@model()
export class TagReferences extends Base {

  @property({
    type: 'string',
  })
  refId?: string;

  @property({
    type: 'string',
  })
  tagId?: string;

  constructor(data?: Partial<TagReferences>) {
    super(data);
  }
}

export interface TagReferencesRelations {
  // describe navigational properties here
}

export type TagReferencesWithRelations = TagReferences & TagReferencesRelations;
