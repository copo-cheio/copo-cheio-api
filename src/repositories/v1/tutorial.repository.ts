import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {UserRepository} from '.';
import {PostgresSqlDataSource} from '../../datasources';
import {Tutorial, TutorialRelations, TutorialStep, Video} from '../../models';
import {BaseRepository} from '../base.repository.base';
import {TutorialStepRepository} from './tutorial-step.repository';
import {VideoRepository} from './video.repository';

export class TutorialRepository extends BaseRepository<
  Tutorial,
  typeof Tutorial.prototype.id,
  TutorialRelations
> {
  public readonly video: BelongsToAccessor<Video, typeof Tutorial.prototype.id>;

  public readonly steps: HasManyRepositoryFactory<
    TutorialStep,
    typeof Tutorial.prototype.id
  >;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('VideoRepository')
    protected videoRepositoryGetter: Getter<VideoRepository>,
    @repository.getter('TutorialStepRepository')
    protected tutorialStepRepositoryGetter: Getter<TutorialStepRepository>,
  ) {
    super(Tutorial, dataSource);
    this.steps = this.createHasManyRepositoryFactoryFor(
      'steps',
      tutorialStepRepositoryGetter,
    );
    this.registerInclusionResolver('steps', this.steps.inclusionResolver);
    this.video = this.createBelongsToAccessorFor(
      'video',
      videoRepositoryGetter,
    );
    this.registerInclusionResolver('video', this.video.inclusionResolver);
  }
}
