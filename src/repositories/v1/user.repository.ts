import {Getter, inject} from '@loopback/core';
import {
  HasManyRepositoryFactory,
  HasOneRepositoryFactory,
  repository,
} from '@loopback/repository';
import {PostgresSqlDataSource} from '../../datasources';
import {
  ActivityV2,
  CheckInV2,
  Favorite,
  OrderV2,
  ShoppingCart,
  User,
  UserRelations,
} from '../../models';
import {ActivityV2Repository} from '../activity-v2.repository';
import {BaseRepository} from '../base.repository.base';
import {CheckInV2Repository} from '../check-in-v2.repository';
import {OrderV2Repository} from '../order-v2.repository';
import {FavoriteRepository} from './favorite.repository';
import {ShoppingCartRepository} from './shopping-cart.repository';

export class UserRepository extends BaseRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  public readonly shoppingCart: HasOneRepositoryFactory<
    ShoppingCart,
    typeof User.prototype.id
  >;

  public readonly favorites: HasManyRepositoryFactory<
    Favorite,
    typeof User.prototype.id
  >;

  public readonly ordersV2: HasManyRepositoryFactory<
    OrderV2,
    typeof User.prototype.id
  >;

  public readonly checkInV2: HasOneRepositoryFactory<
    CheckInV2,
    typeof User.prototype.id
  >;

  public readonly activitiesV2: HasManyRepositoryFactory<
    ActivityV2,
    typeof User.prototype.id
  >;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('ShoppingCartRepository')
    protected shoppingCartRepositoryGetter: Getter<ShoppingCartRepository>,
    @repository.getter('FavoriteRepository')
    protected favoriteRepositoryGetter: Getter<FavoriteRepository>,
    @repository.getter('OrderV2Repository')
    protected orderV2RepositoryGetter: Getter<OrderV2Repository>,
    @repository.getter('CheckInV2Repository')
    protected checkInV2RepositoryGetter: Getter<CheckInV2Repository>,
    @repository.getter('ActivityV2Repository')
    protected activityV2RepositoryGetter: Getter<ActivityV2Repository>,
    // @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    // protected readonly getCurrentUser?: Getter<User | undefined>,
  ) {
    super(User, dataSource);
    this.activitiesV2 = this.createHasManyRepositoryFactoryFor(
      'activitiesV2',
      activityV2RepositoryGetter,
    );
    this.registerInclusionResolver(
      'activitiesV2',
      this.activitiesV2.inclusionResolver,
    );
    this.checkInV2 = this.createHasOneRepositoryFactoryFor(
      'checkInV2',
      checkInV2RepositoryGetter,
    );
    this.registerInclusionResolver(
      'checkInV2',
      this.checkInV2.inclusionResolver,
    );
    this.ordersV2 = this.createHasManyRepositoryFactoryFor(
      'ordersV2',
      orderV2RepositoryGetter,
    );
    this.registerInclusionResolver('ordersV2', this.ordersV2.inclusionResolver);
    this.favorites = this.createHasManyRepositoryFactoryFor(
      'favorites',
      favoriteRepositoryGetter,
    );
    this.registerInclusionResolver(
      'favorites',
      this.favorites.inclusionResolver,
    );
    this.shoppingCart = this.createHasOneRepositoryFactoryFor(
      'shoppingCart',
      shoppingCartRepositoryGetter,
    );
    this.registerInclusionResolver(
      'shoppingCart',
      this.shoppingCart.inclusionResolver,
    );
  }

  async getFavorites(userId: string) {
    const favorites: any = await this.favorites(userId).find();

    const result: any = {
      events: [],
      places: [],
    };
    for (const fav of favorites) {
      /*       const fav: any = favorites[i]; */
      const id: any = fav.eventId || fav.placeId;
      if (fav.eventId && result.events.indexOf(id) == -1)
        result.events.push(id);
      if (fav.placeId && result.places.indexOf(id) == -1)
        result.places.push(id);
    }

    return result;
  }
}
