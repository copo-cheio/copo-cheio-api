import {Getter,inject} from "@loopback/core";
import {
  HasManyThroughRepositoryFactory,
  ReferencesManyAccessor,
  repository
} from "@loopback/repository";
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from "../datasources";
import {
  Playlist,
  PlaylistRelations,
  PlaylistSong,
  Song,
  Tag,
} from "../models";
import {PlaylistSongRepository} from "./playlist-song.repository";
import {SongRepository} from "./song.repository";
import {TagRepository} from "./tag.repository";

export class PlaylistRepository extends SoftCrudRepository<
  //export class PlaylistRepository extends DeepCrudRepository<
  Playlist,
  typeof Playlist.prototype.id,
  PlaylistRelations
> {
  public readonly songs: HasManyThroughRepositoryFactory<
    Song,
    typeof Song.prototype.id,
    PlaylistSong,
    typeof Playlist.prototype.id
  >;

  public readonly tags: ReferencesManyAccessor<
    Tag,
    typeof Playlist.prototype.id
  >;

  constructor(
    @inject("datasources.PostgresSql") dataSource: PostgresSqlDataSource,
    @repository.getter("PlaylistSongRepository")
    protected playlistSongRepositoryGetter: Getter<PlaylistSongRepository>,
    @repository.getter("SongRepository")
    protected songRepositoryGetter: Getter<SongRepository>,
    @repository.getter("TagRepository")
    protected tagRepositoryGetter: Getter<TagRepository>
  ) {
    super(Playlist, dataSource);
    this.tags = this.createReferencesManyAccessorFor(
      "tags",
      tagRepositoryGetter
    );
    this.registerInclusionResolver("tags", this.tags.inclusionResolver);

    this.songs = this.createHasManyThroughRepositoryFactoryFor(
      "songs",
      songRepositoryGetter,
      playlistSongRepositoryGetter
    );
    this.registerInclusionResolver("songs", this.songs.inclusionResolver);
  }
}
