import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SqliteDbDataSource} from '../datasources';
import {TagReferences,TagReferencesRelations} from '../models';

export class TagReferencesRepository extends DefaultCrudRepository<
  TagReferences,
  typeof TagReferences.prototype.id,
  TagReferencesRelations
> {
  constructor(
    @inject('datasources.SqliteDb') dataSource: SqliteDbDataSource,
  ) {
    super(TagReferences, dataSource);
  }
}
