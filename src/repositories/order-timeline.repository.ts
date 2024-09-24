import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {OrderTimeline,OrderTimelineRelations} from '../models';

export class OrderTimelineRepository extends DefaultCrudRepository<
  OrderTimeline,
  typeof OrderTimeline.prototype.id,
  OrderTimelineRelations
> {
  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
  ) {
    super(OrderTimeline, dataSource);
  }
}
