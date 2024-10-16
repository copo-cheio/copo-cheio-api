import {inject} from '@loopback/core';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../datasources';
import {Timeline,TimelineRelations} from '../models';

export class TimelineRepository extends SoftCrudRepository<
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
