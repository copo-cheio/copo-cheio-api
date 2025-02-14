import {inject} from '@loopback/core';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../../datasources';
import {EventRule, EventRuleRelations} from '../../models';

export class EventRuleRepository extends SoftCrudRepository<
  EventRule,
  typeof EventRule.prototype.id,
  EventRuleRelations
> {
  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
  ) {
    super(EventRule, dataSource);
  }
}
