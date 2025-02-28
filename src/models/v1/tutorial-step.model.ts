import {model, property} from '@loopback/repository';
import {Base} from './base.model';

@model()
export class TutorialStep extends Base {
  @property({
    type: 'number',
    default: 1,
  })
  step?: number;

  @property({
    type: 'string',
  })
  title?: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'string',
  })
  tutorialId?: string;

  constructor(data?: Partial<TutorialStep>) {
    super(data);
  }
}

export interface TutorialStepRelations {
  // describe navigational properties here
}

export type TutorialStepWithRelations = TutorialStep & TutorialStepRelations;
