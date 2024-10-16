import {Getter,inject} from '@loopback/core';
import {BelongsToAccessor,repository} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../datasources';
import {Event,EventInstance,EventInstanceRelations} from '../models';
import {EventRepository} from './event.repository';

export class EventInstanceRepository extends SoftCrudRepository<
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
