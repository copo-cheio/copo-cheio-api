import {Getter,inject} from "@loopback/core";
import {
  DefaultCrudRepository,
  HasManyThroughRepositoryFactory,
  repository, BelongsToAccessor} from "@loopback/repository";
import {SqliteDbDataSource} from "../datasources";
import {Artist,ArtistRelations,Tag,TagReferences, Playlist, Image} from "../models";
import {TagReferencesRepository} from "./tag-references.repository";
import {TagRepository} from "./tag.repository";
import {PlaylistRepository} from './playlist.repository';
import {ImageRepository} from './image.repository';

export class ArtistRepository extends DefaultCrudRepository<
  Artist,
  typeof Artist.prototype.id,
  ArtistRelations
> {
  public readonly tags: HasManyThroughRepositoryFactory<
    Tag,
    typeof Tag.prototype.id,
    TagReferences,
    typeof Artist.prototype.id
  >;

  public readonly playlist: BelongsToAccessor<Playlist, typeof Artist.prototype.id>;

  public readonly cover: BelongsToAccessor<Image, typeof Artist.prototype.id>;

  constructor(
    @inject("datasources.SqliteDb") dataSource: SqliteDbDataSource,

    @repository.getter("TagReferencesRepository")
    protected tagRelationsRepositoryGetter: Getter<TagReferencesRepository>,
    @repository.getter("TagRepository")
    protected tagRepositoryGetter: Getter<TagRepository>, @repository.getter('PlaylistRepository') protected playlistRepositoryGetter: Getter<PlaylistRepository>, @repository.getter('ImageRepository') protected imageRepositoryGetter: Getter<ImageRepository>,
  ) {
    super(Artist, dataSource);
    this.cover = this.createBelongsToAccessorFor('cover', imageRepositoryGetter,);
    this.registerInclusionResolver('cover', this.cover.inclusionResolver);
    this.playlist = this.createBelongsToAccessorFor('playlist', playlistRepositoryGetter,);
    this.registerInclusionResolver('playlist', this.playlist.inclusionResolver);
    this.tags = this.createHasManyThroughRepositoryFactoryFor(
      "tags",
      tagRepositoryGetter,
      tagRelationsRepositoryGetter
    );
    this.registerInclusionResolver("tags", this.tags.inclusionResolver);
  }
}
