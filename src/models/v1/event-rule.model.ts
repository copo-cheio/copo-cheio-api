import {model, property} from '@loopback/repository';
import {Base} from './base.model';

@model()
export class EventRule extends Base {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  code: string;

  @property({
    type: 'string',
    required: true,
  })
  value: string;

  @property({
    type: 'string',
  })
  eventId?: string;

  @property({
    type: 'string',
  })
  ruleId?: string;

  constructor(data?: Partial<EventRule>) {
    super(data);
  }
}

export interface EventRuleRelations {
  // describe navigational properties here
}

export type EventRuleWithRelations = EventRule & EventRuleRelations;
