import {inject, Getter} from '@loopback/core';

import {PostgresSqlDataSource} from '../datasources';
import {Video, VideoRelations, Tag} from '../models';
import {BaseRepository} from './base.repository.base';
import {repository, ReferencesManyAccessor} from '@loopback/repository';
import {TagRepository} from './tag.repository';

export class VideoRepository extends BaseRepository<
  Video,
  typeof Video.prototype.id,
  VideoRelations
> {

  public readonly tags: ReferencesManyAccessor<Tag, typeof Video.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('TagRepository') protected tagRepositoryGetter: Getter<TagRepository>,
  ) {
    super(Video, dataSource);
    this.tags = this.createReferencesManyAccessorFor('tags', tagRepositoryGetter,);
    this.registerInclusionResolver('tags', this.tags.inclusionResolver);
  }
}
