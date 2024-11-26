import {inject, Getter} from '@loopback/core';

import {PostgresSqlDataSource} from '../datasources';
import {Favorite,FavoriteRelations, User, Event, Place} from '../models';
import {BaseRepository} from './base.repository.base';
import {repository, BelongsToAccessor} from '@loopback/repository';
import {UserRepository} from './user.repository';
import {EventRepository} from './event.repository';
import {PlaceRepository} from './place.repository';

export class FavoriteRepository extends BaseRepository<
  Favorite,
  typeof Favorite.prototype.id,
  FavoriteRelations
> {

  public readonly user: BelongsToAccessor<User, typeof Favorite.prototype.id>;

  public readonly event: BelongsToAccessor<Event, typeof Favorite.prototype.id>;

  public readonly place: BelongsToAccessor<Place, typeof Favorite.prototype.id>;

  constructor(
    @inject("datasources.PostgresSql") dataSource: PostgresSqlDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('EventRepository') protected eventRepositoryGetter: Getter<EventRepository>, @repository.getter('PlaceRepository') protected placeRepositoryGetter: Getter<PlaceRepository>,
  ) {
    super(Favorite, dataSource);
    this.place = this.createBelongsToAccessorFor('place', placeRepositoryGetter,);
    this.registerInclusionResolver('place', this.place.inclusionResolver);
    this.event = this.createBelongsToAccessorFor('event', eventRepositoryGetter,);
    this.registerInclusionResolver('event', this.event.inclusionResolver);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
