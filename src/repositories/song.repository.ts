import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {SqliteDbDataSource} from '../datasources';
import {Song, SongRelations, Artist, Image} from '../models';
import {ArtistRepository} from './artist.repository';
import {ImageRepository} from './image.repository';

export class SongRepository extends DefaultCrudRepository<
  Song,
  typeof Song.prototype.id,
  SongRelations
> {

  public readonly artist: BelongsToAccessor<Artist, typeof Song.prototype.id>;

  public readonly thumbnail: BelongsToAccessor<Image, typeof Song.prototype.id>;

  constructor(
    @inject('datasources.SqliteDb') dataSource: SqliteDbDataSource, @repository.getter('ArtistRepository') protected artistRepositoryGetter: Getter<ArtistRepository>, @repository.getter('ImageRepository') protected imageRepositoryGetter: Getter<ImageRepository>,
  ) {
    super(Song, dataSource);
    this.thumbnail = this.createBelongsToAccessorFor('thumbnail', imageRepositoryGetter,);
    this.registerInclusionResolver('thumbnail', this.thumbnail.inclusionResolver);
    this.artist = this.createBelongsToAccessorFor('artist', artistRepositoryGetter,);
    this.registerInclusionResolver('artist', this.artist.inclusionResolver);
  }
}
