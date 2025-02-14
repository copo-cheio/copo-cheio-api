import {model, property} from '@loopback/repository';
import {Base} from './base.model';

@model()
export class Translation extends Base {
  @property({
    type: 'string',
    // required: true,
  })
  code: string;

  @property({
    type: 'string',
    required: true,
  })
  pt: string;

  @property({
    type: 'string',
    required: true,
  })
  en: string;

  @property({
    type: 'boolean',
  })
  live?: boolean;

  constructor(data?: Partial<Translation>) {
    super(data);
  }
}

export interface TranslationRelations {
  // describe navigational properties here
}

export type TranslationWithRelations = Translation & TranslationRelations;
