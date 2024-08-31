import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {Timeline,TimelineRelations} from '../models';

export class TimelineRepository extends DefaultCrudRepository<
  Timeline,
  typeof Timeline.prototype.id,
  TimelineRelations
> {
  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
  ) {
    super(Timeline, dataSource);
  }
}
