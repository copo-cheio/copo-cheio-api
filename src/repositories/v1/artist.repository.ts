import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  ReferencesManyAccessor,
  repository,
} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../../datasources';
import {Artist, ArtistRelations, Image, Playlist, Tag} from '../../models';
import {TagRepository} from '../tag.repository';
import {ImageRepository} from './image.repository';
import {PlaylistRepository} from './playlist.repository';

export class ArtistRepository extends SoftCrudRepository<
  Artist,
  typeof Artist.prototype.id,
  ArtistRelations
> {
  public readonly tags: ReferencesManyAccessor<Tag, typeof Artist.prototype.id>;

  public readonly playlist: BelongsToAccessor<
    Playlist,
    typeof Artist.prototype.id
  >;

  public readonly cover: BelongsToAccessor<Image, typeof Artist.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,

    @repository.getter('PlaylistRepository')
    protected playlistRepositoryGetter: Getter<PlaylistRepository>,
    @repository.getter('ImageRepository')
    protected imageRepositoryGetter: Getter<ImageRepository>,
    @repository.getter('TagRepository')
    protected tagRepositoryGetter: Getter<TagRepository>,
  ) {
    super(Artist, dataSource);
    this.tags = this.createReferencesManyAccessorFor(
      'tags',
      tagRepositoryGetter,
    );
    this.registerInclusionResolver('tags', this.tags.inclusionResolver);
    this.cover = this.createBelongsToAccessorFor(
      'cover',
      imageRepositoryGetter,
    );
    this.registerInclusionResolver('cover', this.cover.inclusionResolver);
    this.playlist = this.createBelongsToAccessorFor(
      'playlist',
      playlistRepositoryGetter,
    );
    this.registerInclusionResolver('playlist', this.playlist.inclusionResolver);
  }
}
