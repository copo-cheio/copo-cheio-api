import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {Activity,ActivityRelations, User, Place, Event, Balcony} from '../models';
import {UserRepository} from './user.repository';
import {PlaceRepository} from './place.repository';
import {EventRepository} from './event.repository';
import {BalconyRepository} from './balcony.repository';

export class ActivityRepository extends DefaultCrudRepository<
  Activity,
  typeof Activity.prototype.id,
  ActivityRelations
> {

  public readonly user: BelongsToAccessor<User, typeof Activity.prototype.id>;

  public readonly place: BelongsToAccessor<Place, typeof Activity.prototype.id>;

  public readonly event: BelongsToAccessor<Event, typeof Activity.prototype.id>;

  public readonly balcony: BelongsToAccessor<Balcony, typeof Activity.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('PlaceRepository') protected placeRepositoryGetter: Getter<PlaceRepository>, @repository.getter('EventRepository') protected eventRepositoryGetter: Getter<EventRepository>, @repository.getter('BalconyRepository') protected balconyRepositoryGetter: Getter<BalconyRepository>,
  ) {
    super(Activity, dataSource);
    this.balcony = this.createBelongsToAccessorFor('balcony', balconyRepositoryGetter,);
    this.registerInclusionResolver('balcony', this.balcony.inclusionResolver);
    this.event = this.createBelongsToAccessorFor('event', eventRepositoryGetter,);
    this.registerInclusionResolver('event', this.event.inclusionResolver);
    this.place = this.createBelongsToAccessorFor('place', placeRepositoryGetter,);
    this.registerInclusionResolver('place', this.place.inclusionResolver);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
