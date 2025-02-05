import {model,property} from '@loopback/repository';
import {Base} from './base.model';

@model()
export class DeviceToken extends Base {
  @property({
    type: 'string',
    required: true,
  })
  token: string;

  @property({
    type: 'string',
  })
  userId?: string;

  constructor(data?: Partial<DeviceToken>) {
    super(data);
  }
}

export interface DeviceTokenRelations {
  // describe navigational properties here
}

export type DeviceTokenWithRelations = DeviceToken & DeviceTokenRelations;
