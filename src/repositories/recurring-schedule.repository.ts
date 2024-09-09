import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {RecurringSchedule,RecurringScheduleRelations, Event} from '../models';
import {EventRepository} from './event.repository';

export class RecurringScheduleRepository extends DefaultCrudRepository<
  RecurringSchedule,
  typeof RecurringSchedule.prototype.id,
  RecurringScheduleRelations
> {

  public readonly event: BelongsToAccessor<Event, typeof RecurringSchedule.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('EventRepository') protected eventRepositoryGetter: Getter<EventRepository>,
  ) {
    super(RecurringSchedule, dataSource);
    this.event = this.createBelongsToAccessorFor('event', eventRepositoryGetter,);
    this.registerInclusionResolver('event', this.event.inclusionResolver);
  }
}
