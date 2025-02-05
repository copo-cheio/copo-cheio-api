import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../../datasources';
import {Artist, Image, Song, SongRelations} from '../../models/v1';
import {ArtistRepository} from './artist.repository';
import {ImageRepository} from './image.repository';

export class SongRepository extends SoftCrudRepository<
  Song,
  typeof Song.prototype.id,
  SongRelations
> {
  public readonly artist: BelongsToAccessor<Artist, typeof Song.prototype.id>;

  public readonly thumbnail: BelongsToAccessor<Image, typeof Song.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('ArtistRepository')
    protected artistRepositoryGetter: Getter<ArtistRepository>,
    @repository.getter('ImageRepository')
    protected imageRepositoryGetter: Getter<ImageRepository>,
  ) {
    super(Song, dataSource);
    this.thumbnail = this.createBelongsToAccessorFor(
      'thumbnail',
      imageRepositoryGetter,
    );
    this.registerInclusionResolver(
      'thumbnail',
      this.thumbnail.inclusionResolver,
    );
    this.artist = this.createBelongsToAccessorFor(
      'artist',
      artistRepositoryGetter,
    );
    this.registerInclusionResolver('artist', this.artist.inclusionResolver);
  }
}
