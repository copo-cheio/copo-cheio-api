import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {EventInstance,EventInstanceRelations, Event} from '../models';
import {EventRepository} from './event.repository';

export class EventInstanceRepository extends DefaultCrudRepository<
  EventInstance,
  typeof EventInstance.prototype.id,
  EventInstanceRelations
> {

  public readonly event: BelongsToAccessor<Event, typeof EventInstance.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('EventRepository') protected eventRepositoryGetter: Getter<EventRepository>,
  ) {
    super(EventInstance, dataSource);
    this.event = this.createBelongsToAccessorFor('event', eventRepositoryGetter,);
    this.registerInclusionResolver('event', this.event.inclusionResolver);
  }
}
