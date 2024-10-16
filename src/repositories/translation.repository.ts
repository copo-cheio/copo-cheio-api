import {inject} from '@loopback/core';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../datasources';
import {Translation,TranslationRelations} from '../models';

export class TranslationRepository extends SoftCrudRepository<
  Translation,
  typeof Translation.prototype.id,
  TranslationRelations
> {
  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
  ) {
    super(Translation, dataSource);
  }
}
