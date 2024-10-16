import {Getter,inject} from '@loopback/core';
import {BelongsToAccessor,repository} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../datasources';
import {Event,RecurringSchedule,RecurringScheduleRelations} from '../models';
import {EventRepository} from './event.repository';

export class RecurringScheduleRepository extends SoftCrudRepository<
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
