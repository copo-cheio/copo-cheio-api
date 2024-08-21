import { model, property } from '@loopback/repository';
import { Base } from './base.model';

@model()
export class Rule extends Base {
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


  constructor(data?: Partial<Rule>) {
    super(data);
  }
}

export interface RuleRelations {
  // describe navigational properties here
}

export type RuleWithRelations = Rule & RuleRelations;
