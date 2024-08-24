import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {PlaceRule,PlaceRuleRelations} from '../models';

export class PlaceRuleRepository extends DefaultCrudRepository<
  PlaceRule,
  typeof PlaceRule.prototype.id,
  PlaceRuleRelations
> {
  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
  ) {
    super(PlaceRule, dataSource);
  }
}
