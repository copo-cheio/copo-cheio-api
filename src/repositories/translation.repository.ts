import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {Translation,TranslationRelations} from '../models';

export class TranslationRepository extends DefaultCrudRepository<
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
