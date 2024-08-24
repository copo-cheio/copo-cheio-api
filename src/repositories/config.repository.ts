import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {Config,ConfigRelations} from '../models';

export class ConfigRepository extends DefaultCrudRepository<
  Config,
  typeof Config.prototype.id,
  ConfigRelations
> {
  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
  ) {
    super(Config, dataSource);
  }
}
