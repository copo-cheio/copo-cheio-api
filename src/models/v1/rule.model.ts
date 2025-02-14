import {belongsTo, model, property} from '@loopback/repository';
import {Base} from './base.model';
import {Translation} from './translation.model';

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

  @belongsTo(() => Translation)
  translationId: string;

  @belongsTo(() => Translation)
  valueTranslationId: string;

  constructor(data?: Partial<Rule>) {
    super(data);
  }
}

export interface RuleRelations {
  // describe navigational properties here
}

export type RuleWithRelations = Rule & RuleRelations;
