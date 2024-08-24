import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {EventRule,EventRuleRelations} from '../models';

export class EventRuleRepository extends DefaultCrudRepository<
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
