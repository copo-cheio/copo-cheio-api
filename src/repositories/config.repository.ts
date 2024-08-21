import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SqliteDbDataSource} from '../datasources';
import {Config, ConfigRelations} from '../models';

export class ConfigRepository extends DefaultCrudRepository<
  Config,
  typeof Config.prototype.id,
  ConfigRelations
> {
  constructor(
    @inject('datasources.SqliteDb') dataSource: SqliteDbDataSource,
  ) {
    super(Config, dataSource);
  }
}
