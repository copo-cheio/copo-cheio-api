import {AuthenticationBindings} from '@loopback/authentication';
import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../../datasources';
import {
  Event,
  EventInstance,
  EventInstanceRelations,
  Team,
} from '../../models/v1';
import {EventRepository} from './event.repository';
import {TeamRepository} from './team.repository';

export class EventInstanceRepository extends SoftCrudRepository<
  EventInstance,
  typeof EventInstance.prototype.id,
  EventInstanceRelations
> {
  public readonly event: BelongsToAccessor<
    Event,
    typeof EventInstance.prototype.id
  >;

  public readonly team: BelongsToAccessor<
    Team,
    typeof EventInstance.prototype.id
  >;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('EventRepository')
    protected eventRepositoryGetter: Getter<EventRepository>,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public readonly getCurrentUser: Getter<any>,
    @repository.getter('TeamRepository')
    protected teamRepositoryGetter: Getter<TeamRepository>,
  ) {
    super(EventInstance, dataSource, getCurrentUser);
    this.team = this.createBelongsToAccessorFor('team', teamRepositoryGetter);
    this.registerInclusionResolver('team', this.team.inclusionResolver);
    this.event = this.createBelongsToAccessorFor(
      'event',
      eventRepositoryGetter,
    );
    this.registerInclusionResolver('event', this.event.inclusionResolver);
  }

  async getIdentifier() {
    return this.getCurrentUser();
    // return this.id;
  }

  async deleteIfExistsById(deleteInstanceId: string) {
    try {
      await this.deleteById(deleteInstanceId);
    } catch (ex) {
      console.log('instance with id ', deleteInstanceId, 'not found');
    }
  }

  async forceUpdateById(id: string, data: any) {
    try {
      await this.undoSoftDeleteById(id);
    } catch (ex) {}
    if (data.id) {
      id = data.id;
      delete data.id;
    }

    return this.updateById(id, data);
    // return this.updateAll(data, condition);
  }
}
