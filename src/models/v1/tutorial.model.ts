import {belongsTo, hasMany, model, property} from '@loopback/repository';
import {TutorialStep} from './tutorial-step.model';
import {Video} from './video.model';

import {Base, mergeBaseModelConfiguration} from './base.model';
@model(mergeBaseModelConfiguration({}))
export class Tutorial extends Base {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'string',
    required: true,
  })
  audience: string;

  @belongsTo(() => Video)
  videoId: string;

  @hasMany(() => TutorialStep)
  steps: TutorialStep[];

  constructor(data?: Partial<Tutorial>) {
    super(data);
  }
}

export interface TutorialRelations {
  // describe navigational properties here
}

export type TutorialWithRelations = Tutorial & TutorialRelations;
