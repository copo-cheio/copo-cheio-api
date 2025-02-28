import {Getter, inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {UserRepository} from '.';
import {PostgresSqlDataSource} from '../../datasources';
import {TutorialStep, TutorialStepRelations} from '../../models';
import {BaseRepository} from '../base.repository.base';

export class TutorialStepRepository extends BaseRepository<
  TutorialStep,
  typeof TutorialStep.prototype.id,
  TutorialStepRelations
> {
  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(TutorialStep, dataSource);
  }
}
