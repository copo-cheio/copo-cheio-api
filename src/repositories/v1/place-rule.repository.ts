import {inject} from '@loopback/core';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../../datasources';
import {PlaceRule, PlaceRuleRelations} from '../../models/v1';

export class PlaceRuleRepository extends SoftCrudRepository<
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
