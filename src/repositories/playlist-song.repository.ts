import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SqliteDbDataSource} from '../datasources';
import {PlaylistSong, PlaylistSongRelations} from '../models';

export class PlaylistSongRepository extends DefaultCrudRepository<
  PlaylistSong,
  typeof PlaylistSong.prototype.id,
  PlaylistSongRelations
> {
  constructor(
    @inject('datasources.SqliteDb') dataSource: SqliteDbDataSource,
  ) {
    super(PlaylistSong, dataSource);
  }
}
