import {model, property} from '@loopback/repository';
import {Base} from './base.model';

@model()
export class Config extends Base {
  @property({
    type: 'string',
    required: true,
  })
  component: string;

  @property({
    type: 'string',
    required: true,
  })
  version: string;

  constructor(data?: Partial<Config>) {
    super(data);
  }
}

export interface ConfigRelations {
  // describe navigational properties here
}

export type ConfigWithRelations = Config & ConfigRelations;
