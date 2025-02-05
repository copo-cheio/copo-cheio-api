import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../../datasources';
import {Playlist, TimeTable, TimeTableRelations} from '../../models/v1';
import {BaseRepository} from './base.repository.base';
import {PlaylistRepository} from './playlist.repository';

export class TimeTableRepository extends BaseRepository<
  TimeTable,
  typeof TimeTable.prototype.id,
  TimeTableRelations
> {
  public readonly playlist: BelongsToAccessor<
    Playlist,
    typeof TimeTable.prototype.id
  >;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('PlaylistRepository')
    protected playlistRepositoryGetter: Getter<PlaylistRepository>,
  ) {
    super(TimeTable, dataSource);
    this.playlist = this.createBelongsToAccessorFor(
      'playlist',
      playlistRepositoryGetter,
    );
    this.registerInclusionResolver('playlist', this.playlist.inclusionResolver);
  }
}
