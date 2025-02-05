import {AuthenticationBindings} from '@loopback/authentication';
import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../../datasources';
import {
  Activity,
  ActivityRelations,
  Balcony,
  Event,
  Place,
  User,
} from '../../models/v1';
import {BalconyRepository} from './balcony.repository';
import {EventRepository} from './event.repository';
import {PlaceRepository} from './place.repository';
import {UserRepository} from './user.repository';

export class ActivityRepository extends SoftCrudRepository<
  Activity,
  typeof Activity.prototype.id,
  ActivityRelations
> {
  public readonly user: BelongsToAccessor<User, typeof Activity.prototype.id>;

  public readonly place: BelongsToAccessor<Place, typeof Activity.prototype.id>;

  public readonly event: BelongsToAccessor<Event, typeof Activity.prototype.id>;

  public readonly balcony: BelongsToAccessor<
    Balcony,
    typeof Activity.prototype.id
  >;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('PlaceRepository')
    protected placeRepositoryGetter: Getter<PlaceRepository>,
    @repository.getter('EventRepository')
    protected eventRepositoryGetter: Getter<EventRepository>,
    @repository.getter('BalconyRepository')
    protected balconyRepositoryGetter: Getter<BalconyRepository>,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public readonly getCurrentUser: Getter<any>,
  ) {
    super(Activity, dataSource, getCurrentUser);
    this.balcony = this.createBelongsToAccessorFor(
      'balcony',
      balconyRepositoryGetter,
    );
    this.registerInclusionResolver('balcony', this.balcony.inclusionResolver);
    this.event = this.createBelongsToAccessorFor(
      'event',
      eventRepositoryGetter,
    );
    this.registerInclusionResolver('event', this.event.inclusionResolver);
    this.place = this.createBelongsToAccessorFor(
      'place',
      placeRepositoryGetter,
    );
    this.registerInclusionResolver('place', this.place.inclusionResolver);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
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
