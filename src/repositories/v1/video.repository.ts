import {Getter, inject} from '@loopback/core';

import {
  BelongsToAccessor,
  ReferencesManyAccessor,
  repository,
} from '@loopback/repository';
import {PostgresSqlDataSource} from '../../datasources';

import {BaseRepository} from '../base.repository.base';

import {Image} from '../../models';
import {Video, VideoRelations} from '../../models/v1/video.model';

import {Tag} from '../../models/v1/tag.model';
import {ImageRepository} from './image.repository';
import {TagRepository} from './tag.repository';

export class VideoRepository extends BaseRepository<
  Video,
  typeof Video.prototype.id,
  VideoRelations
> {
  public readonly tags: ReferencesManyAccessor<Tag, typeof Video.prototype.id>;

  public readonly cover: BelongsToAccessor<Image, typeof Video.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('TagRepository')
    protected tagRepositoryGetter: Getter<TagRepository>,
    @repository.getter('ImageRepository')
    protected imageRepositoryGetter: Getter<ImageRepository>,
  ) {
    super(Video, dataSource);
    this.cover = this.createBelongsToAccessorFor(
      'cover',
      imageRepositoryGetter,
    );
    this.registerInclusionResolver('cover', this.cover.inclusionResolver);
    this.tags = this.createReferencesManyAccessorFor(
      'tags',
      tagRepositoryGetter,
    );
    this.registerInclusionResolver('tags', this.tags.inclusionResolver);
  }
}
