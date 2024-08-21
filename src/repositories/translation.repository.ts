import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SqliteDbDataSource} from '../datasources';
import {Translation, TranslationRelations} from '../models';

export class TranslationRepository extends DefaultCrudRepository<
  Translation,
  typeof Translation.prototype.id,
  TranslationRelations
> {
  constructor(
    @inject('datasources.SqliteDb') dataSource: SqliteDbDataSource,
  ) {
    super(Translation, dataSource);
  }
}
