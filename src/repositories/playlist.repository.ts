import {inject, Getter} from "@loopback/core";
import {
  DefaultCrudRepository, repository, HasManyThroughRepositoryFactory} from "@loopback/repository";
import {SqliteDbDataSource} from "../datasources";
import {
  Playlist,
  PlaylistRelations, Song, PlaylistSong} from "../models";
import {PlaylistSongRepository} from './playlist-song.repository';
import {SongRepository} from './song.repository';

export class PlaylistRepository extends DefaultCrudRepository<
  Playlist,
  typeof Playlist.prototype.id,
  PlaylistRelations
> {

  public readonly songs: HasManyThroughRepositoryFactory<Song, typeof Song.prototype.id,
          PlaylistSong,
          typeof Playlist.prototype.id
        >;

  constructor(
    @inject("datasources.SqliteDb") dataSource: SqliteDbDataSource, @repository.getter('PlaylistSongRepository') protected playlistSongRepositoryGetter: Getter<PlaylistSongRepository>, @repository.getter('SongRepository') protected songRepositoryGetter: Getter<SongRepository>,


  ) {
    super(Playlist, dataSource);
    this.songs = this.createHasManyThroughRepositoryFactoryFor('songs', songRepositoryGetter, playlistSongRepositoryGetter,);
    this.registerInclusionResolver('songs', this.songs.inclusionResolver);



  }
}
