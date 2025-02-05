import {model, property} from '@loopback/repository';
import {Base} from './base.model';

@model()
export class Dev extends Base {
  @property({
    type: 'string',
    required: true,
  })
  app: string;

  @property({
    type: 'string',
    required: true,
  })
  refId: string;

  @property({
    type: 'string',
    required: true,
  })
  action: string;

  @property({
    type: 'object',
  })
  data: any;

  constructor(data?: Partial<Dev>) {
    super(data);
  }
}

export interface DevRelations {
  // describe navigational properties here
}

export type DevWithRelations = Dev & DevRelations;
