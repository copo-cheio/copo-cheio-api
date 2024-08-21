import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {SqliteDbDataSource} from '../datasources';
import {DateTime, DateTimeRelations, Schedule} from '../models';
import {ScheduleRepository} from './schedule.repository';

export class DateTimeRepository extends DefaultCrudRepository<
  DateTime,
  typeof DateTime.prototype.id,
  DateTimeRelations
> {

  public readonly schedule: BelongsToAccessor<Schedule, typeof DateTime.prototype.id>;

  constructor(
    @inject('datasources.SqliteDb') dataSource: SqliteDbDataSource, @repository.getter('ScheduleRepository') protected scheduleRepositoryGetter: Getter<ScheduleRepository>,
  ) {
    super(DateTime, dataSource);
    this.schedule = this.createBelongsToAccessorFor('schedule', scheduleRepositoryGetter,);
    this.registerInclusionResolver('schedule', this.schedule.inclusionResolver);
  }
}
