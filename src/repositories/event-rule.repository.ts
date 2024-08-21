import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SqliteDbDataSource} from '../datasources';
import {EventRule, EventRuleRelations} from '../models';

export class EventRuleRepository extends DefaultCrudRepository<
  EventRule,
  typeof EventRule.prototype.id,
  EventRuleRelations
> {
  constructor(
    @inject('datasources.SqliteDb') dataSource: SqliteDbDataSource,
  ) {
    super(EventRule, dataSource);
  }
}
