import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../../datasources';
import {
  Playlist,
  PlaylistSong,
  PlaylistSongRelations,
  Song,
} from '../../models';
import {PlaylistRepository} from './playlist.repository';
import {SongRepository} from './song.repository';

export class PlaylistSongRepository extends SoftCrudRepository<
  PlaylistSong,
  typeof PlaylistSong.prototype.id,
  PlaylistSongRelations
> {
  public readonly playlist: BelongsToAccessor<
    Playlist,
    typeof PlaylistSong.prototype.id
  >;

  public readonly song: BelongsToAccessor<
    Song,
    typeof PlaylistSong.prototype.id
  >;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('PlaylistRepository')
    protected playlistRepositoryGetter: Getter<PlaylistRepository>,
    @repository.getter('SongRepository')
    protected songRepositoryGetter: Getter<SongRepository>,
  ) {
    super(PlaylistSong, dataSource);
    this.song = this.createBelongsToAccessorFor('song', songRepositoryGetter);
    this.registerInclusionResolver('song', this.song.inclusionResolver);
    this.playlist = this.createBelongsToAccessorFor(
      'playlist',
      playlistRepositoryGetter,
    );
    this.registerInclusionResolver('playlist', this.playlist.inclusionResolver);
  }
}
