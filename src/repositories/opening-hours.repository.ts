import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {OpeningHours,OpeningHoursRelations} from '../models';

export class OpeningHoursRepository extends DefaultCrudRepository<
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