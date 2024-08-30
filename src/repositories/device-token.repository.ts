import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresSqlDataSource} from "../datasources";
import {DeviceToken,DeviceTokenRelations} from '../models';

export class DeviceTokenRepository extends DefaultCrudRepository<
  DeviceToken,
  typeof DeviceToken.prototype.id,
  DeviceTokenRelations
> {
  constructor(
    @inject("datasources.PostgresSql") dataSource: PostgresSqlDataSource,
  ) {
    super(DeviceToken, dataSource);
  }
}
