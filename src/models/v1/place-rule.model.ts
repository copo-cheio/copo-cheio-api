import {model,property} from '@loopback/repository';
import {Base} from './base.model';

@model()
export class PlaceRule extends Base {

  @property({
    type: 'string',
  })
  placeId?: string;

  @property({
    type: 'string',
  })
  ruleId?: string;

  constructor(data?: Partial<PlaceRule>) {
    super(data);
  }
}

export interface PlaceRuleRelations {
  // describe navigational properties here
}

export type PlaceRuleWithRelations = PlaceRule & PlaceRuleRelations;
