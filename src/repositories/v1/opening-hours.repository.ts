import {inject} from '@loopback/core';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../../datasources';
import {OpeningHours, OpeningHoursRelations} from '../../models/v1';

export class OpeningHoursRepository extends SoftCrudRepository<
  OpeningHours,
  typeof OpeningHours.prototype.id,
  OpeningHoursRelations
> {
  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
  ) {
    super(OpeningHours, dataSource);
  }
}
