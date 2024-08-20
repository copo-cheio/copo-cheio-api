import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SqliteDbDataSource} from '../datasources';
import {Balcony, BalconyRelations} from '../models';

export class BalconyRepository extends DefaultCrudRepository<
  Balcony,
  typeof Balcony.prototype.id,
  BalconyRelations
> {
  constructor(
    @inject('datasources.SqliteDb') dataSource: SqliteDbDataSource,
  ) {
    super(Balcony, dataSource);
  }
}
