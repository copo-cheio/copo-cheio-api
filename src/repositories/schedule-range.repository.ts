import {Getter,inject} from '@loopback/core';
import {BelongsToAccessor,repository} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../datasources';
import {DateTime,Schedule,ScheduleRange,ScheduleRangeRelations} from '../models';
import {DateTimeRepository} from './date-time.repository';
import {ScheduleRepository} from './schedule.repository';

export class ScheduleRangeRepository extends SoftCrudRepository<
  ScheduleRange,
  typeof ScheduleRange.prototype.id,
  ScheduleRangeRelations
> {

  public readonly start: BelongsToAccessor<DateTime, typeof ScheduleRange.prototype.id>;

  public readonly end: BelongsToAccessor<DateTime, typeof ScheduleRange.prototype.id>;



  public readonly schedule: BelongsToAccessor<Schedule, typeof ScheduleRange.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('DateTimeRepository') protected dateTimeRepositoryGetter: Getter<DateTimeRepository>, @repository.getter('ScheduleRepository') protected scheduleRepositoryGetter: Getter<ScheduleRepository>,
  ) {
    super(ScheduleRange, dataSource);
    this.schedule = this.createBelongsToAccessorFor('schedule', scheduleRepositoryGetter,);
    this.registerInclusionResolver('schedule', this.schedule.inclusionResolver);

    this.end = this.createBelongsToAccessorFor('end', dateTimeRepositoryGetter,);
    this.registerInclusionResolver('end', this.end.inclusionResolver);
    this.start = this.createBelongsToAccessorFor('start', dateTimeRepositoryGetter,);
    this.registerInclusionResolver('start', this.start.inclusionResolver);
  }
}
