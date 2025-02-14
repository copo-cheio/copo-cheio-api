import {model} from '@loopback/repository';
import {Base} from './base.model';

@model()
export class Timeline extends Base {
  constructor(data?: Partial<Timeline>) {
    super(data);
  }
}

export interface TimelineRelations {
  // describe navigational properties here
}

export type TimelineWithRelations = Timeline & TimelineRelations;
