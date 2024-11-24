import {inject, Getter} from "@loopback/core";
import {PostgresSqlDataSource} from "../datasources";
import {TimeTable,TimeTableRelations, Playlist} from "../models";
import {BaseRepository} from "./base.repository.base";
import {repository, BelongsToAccessor} from '@loopback/repository';
import {PlaylistRepository} from './playlist.repository';

export class TimeTableRepository extends BaseRepository<
  TimeTable,
  typeof TimeTable.prototype.id,
  TimeTableRelations
> {

  public readonly playlist: BelongsToAccessor<Playlist, typeof TimeTable.prototype.id>;

  constructor(
    @inject("datasources.PostgresSql") dataSource: PostgresSqlDataSource, @repository.getter('PlaylistRepository') protected playlistRepositoryGetter: Getter<PlaylistRepository>,
  ) {
    super(TimeTable, dataSource);
    this.playlist = this.createBelongsToAccessorFor('playlist', playlistRepositoryGetter,);
    this.registerInclusionResolver('playlist', this.playlist.inclusionResolver);
  }
}
