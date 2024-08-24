import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {TagReferences,TagReferencesRelations} from '../models';

export class TagReferencesRepository extends DefaultCrudRepository<
  TagReferences,
  typeof TagReferences.prototype.id,
  TagReferencesRelations
> {
  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
  ) {
    super(TagReferences, dataSource);
  }
}
