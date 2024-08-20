import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SqliteDbDataSource} from '../datasources';
import {Place, PlaceRelations} from '../models';

export class PlaceRepository extends DefaultCrudRepository<
  Place,
  typeof Place.prototype.id,
  PlaceRelations
> {
  constructor(
    @inject('datasources.SqliteDb') dataSource: SqliteDbDataSource,
  ) {
    super(Place, dataSource);
  }
}
