import {model} from '@loopback/repository';
import {Base} from './base.model';

@model()
export class Team extends Base {

  constructor(data?: Partial<Team>) {
    super(data);
  }
}

export interface TeamRelations {
  // describe navigational properties here
}

export type TeamWithRelations = Team & TeamRelations;
