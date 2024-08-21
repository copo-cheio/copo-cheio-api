import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SqliteDbDataSource} from '../datasources';
import {Rule, RuleRelations} from '../models';

export class RuleRepository extends DefaultCrudRepository<
  Rule,
  typeof Rule.prototype.id,
  RuleRelations
> {
  constructor(
    @inject('datasources.SqliteDb') dataSource: SqliteDbDataSource,
  ) {
    super(Rule, dataSource);
  }
}
