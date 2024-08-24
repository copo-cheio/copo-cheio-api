import {Getter,inject} from "@loopback/core";
import {
  DefaultCrudRepository,
  HasManyThroughRepositoryFactory,
  repository
} from "@loopback/repository";
import {PostgresSqlDataSource} from '../datasources';
import {
  Playlist,
  PlaylistRelations,
  PlaylistSong,
  Song,
  Tag,TagReferences
} from "../models";
import {PlaylistSongRepository} from './playlist-song.repository';
import {SongRepository} from './song.repository';
import {TagReferencesRepository} from './tag-references.repository';
import {TagRepository} from './tag.repository';

export class PlaylistRepository extends DefaultCrudRepository<
  Playlist,
  typeof Playlist.prototype.id,
  PlaylistRelations
> {

  public readonly songs: HasManyThroughRepositoryFactory<Song, typeof Song.prototype.id,
          PlaylistSong,
          typeof Playlist.prototype.id
        >;

  public readonly tags: HasManyThroughRepositoryFactory<Tag, typeof Tag.prototype.id,
          TagReferences,
          typeof Playlist.prototype.id
        >;

  constructor(
    @inject("datasources.PostgresSql") dataSource: PostgresSqlDataSource, @repository.getter('PlaylistSongRepository') protected playlistSongRepositoryGetter: Getter<PlaylistSongRepository>, @repository.getter('SongRepository') protected songRepositoryGetter: Getter<SongRepository>, @repository.getter('TagReferencesRepository') protected tagReferencesRepositoryGetter: Getter<TagReferencesRepository>, @repository.getter('TagRepository') protected tagRepositoryGetter: Getter<TagRepository>,


  ) {
    super(Playlist, dataSource);
    this.tags = this.createHasManyThroughRepositoryFactoryFor('tags', tagRepositoryGetter, tagReferencesRepositoryGetter,);
    this.registerInclusionResolver('tags', this.tags.inclusionResolver);
    this.songs = this.createHasManyThroughRepositoryFactoryFor('songs', songRepositoryGetter, playlistSongRepositoryGetter,);
    this.registerInclusionResolver('songs', this.songs.inclusionResolver);



  }
}
