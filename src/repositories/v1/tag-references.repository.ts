import {inject} from '@loopback/core';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../../datasources';
import {TagReferences, TagReferencesRelations} from '../../models/v1';

export class TagReferencesRepository extends SoftCrudRepository<
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
