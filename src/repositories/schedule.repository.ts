import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {SqliteDbDataSource} from '../datasources';
import {Schedule, ScheduleRelations, DateTime, ScheduleRange} from '../models';
import {DateTimeRepository} from './date-time.repository';
import {ScheduleRangeRepository} from './schedule-range.repository';

export class ScheduleRepository extends DefaultCrudRepository<
  Schedule,
  typeof Schedule.prototype.id,
  ScheduleRelations
> {

  public readonly dateTimes: HasManyRepositoryFactory<DateTime, typeof Schedule.prototype.id>;

  public readonly scheduleRanges: HasManyRepositoryFactory<ScheduleRange, typeof Schedule.prototype.id>;

  constructor(
    @inject('datasources.SqliteDb') dataSource: SqliteDbDataSource, @repository.getter('DateTimeRepository') protected dateTimeRepositoryGetter: Getter<DateTimeRepository>, @repository.getter('ScheduleRangeRepository') protected scheduleRangeRepositoryGetter: Getter<ScheduleRangeRepository>,
  ) {
    super(Schedule, dataSource);
    this.scheduleRanges = this.createHasManyRepositoryFactoryFor('scheduleRanges', scheduleRangeRepositoryGetter,);
    this.registerInclusionResolver('scheduleRanges', this.scheduleRanges.inclusionResolver);
    this.dateTimes = this.createHasManyRepositoryFactoryFor('dateTimes', dateTimeRepositoryGetter,);
    this.registerInclusionResolver('dateTimes', this.dateTimes.inclusionResolver);
  }
}
