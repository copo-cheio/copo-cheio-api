import {inject} from '@loopback/core';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from "../datasources";
import {DeviceToken,DeviceTokenRelations} from '../models';

export class DeviceTokenRepository extends SoftCrudRepository<
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
