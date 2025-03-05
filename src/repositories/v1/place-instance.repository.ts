import {Getter, inject} from '@loopback/core';

import {BelongsToAccessor, repository} from '@loopback/repository';

import {UserRepository} from '.';
import {PostgresSqlDataSource} from '../../datasources';
import {EventInstance, Place, Team} from '../../models';
import {
  PlaceInstance,
  PlaceInstanceRelations,
} from '../../models/v1/place-instance.model';
import {BaseRepository} from '../base.repository.base';
import {EventInstanceRepository} from './event-instance.repository';
import {PlaceRepository} from './place.repository';
import {TeamRepository} from './team.repository';

export class PlaceInstanceRepository extends BaseRepository<
  PlaceInstance,
  typeof PlaceInstance.prototype.id,
  PlaceInstanceRelations
> {
  public readonly place: BelongsToAccessor<
    Place,
    typeof PlaceInstance.prototype.id
  >;

  public readonly eventInstance: BelongsToAccessor<
    EventInstance,
    typeof PlaceInstance.prototype.id
  >;

  public readonly team: BelongsToAccessor<
    Team,
    typeof PlaceInstance.prototype.id
  >;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('PlaceRepository')
    protected placeRepositoryGetter: Getter<PlaceRepository>,
    @repository.getter('EventInstanceRepository')
    protected eventInstanceRepositoryGetter: Getter<EventInstanceRepository>,
    @repository.getter('TeamRepository')
    protected teamRepositoryGetter: Getter<TeamRepository>,
  ) {
    super(PlaceInstance, dataSource);
    this.team = this.createBelongsToAccessorFor('team', teamRepositoryGetter);
    this.registerInclusionResolver('team', this.team.inclusionResolver);
    this.eventInstance = this.createBelongsToAccessorFor(
      'eventInstance',
      eventInstanceRepositoryGetter,
    );
    this.registerInclusionResolver(
      'eventInstance',
      this.eventInstance.inclusionResolver,
    );
    this.place = this.createBelongsToAccessorFor(
      'place',
      placeRepositoryGetter,
    );
    this.registerInclusionResolver('place', this.place.inclusionResolver);
  }
}
