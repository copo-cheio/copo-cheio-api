import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {
  ImageRepository,
  MenuRepository,
  OrderRepository,
  PlaceRepository,
} from '.';
import {StockRepository} from '..';
import {PostgresSqlDataSource} from '../../datasources';
import {
  Balcony,
  BalconyRelations,
  Image,
  Menu,
  Order,
  OrderV2,
  Place,
  Stock,
} from '../../models';
import {OrderV2Repository} from '../order-v2.repository';

export class BalconyRepository extends SoftCrudRepository<
  Balcony,
  typeof Balcony.prototype.id,
  BalconyRelations
> {
  public readonly place: BelongsToAccessor<Place, typeof Balcony.prototype.id>;

  public readonly cover: BelongsToAccessor<Image, typeof Balcony.prototype.id>;

  public readonly menu: BelongsToAccessor<Menu, typeof Balcony.prototype.id>;

  public readonly orders: HasManyRepositoryFactory<
    Order,
    typeof Balcony.prototype.id
  >;

  public readonly stocks: HasManyRepositoryFactory<
    Stock,
    typeof Balcony.prototype.id
  >;

  public readonly ordersV2: HasManyRepositoryFactory<
    OrderV2,
    typeof Balcony.prototype.id
  >;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('PlaceRepository')
    protected placeRepositoryGetter: Getter<PlaceRepository>,
    @repository.getter('ImageRepository')
    protected imageRepositoryGetter: Getter<ImageRepository>,
    @repository.getter('MenuRepository')
    protected menuRepositoryGetter: Getter<MenuRepository>,
    @repository.getter('OrderRepository')
    protected orderRepositoryGetter: Getter<OrderRepository>,
    @repository.getter('StockRepository')
    protected stockRepositoryGetter: Getter<StockRepository>,
    @repository.getter('OrderV2Repository')
    protected orderV2RepositoryGetter: Getter<OrderV2Repository>,
  ) {
    super(Balcony, dataSource);
    this.ordersV2 = this.createHasManyRepositoryFactoryFor(
      'ordersV2',
      orderV2RepositoryGetter,
    );
    this.registerInclusionResolver('ordersV2', this.ordersV2.inclusionResolver);
    this.stocks = this.createHasManyRepositoryFactoryFor(
      'stocks',
      stockRepositoryGetter,
    );
    this.registerInclusionResolver('stocks', this.stocks.inclusionResolver);
    this.orders = this.createHasManyRepositoryFactoryFor(
      'orders',
      orderRepositoryGetter,
    );
    this.registerInclusionResolver('orders', this.orders.inclusionResolver);
    this.menu = this.createBelongsToAccessorFor('menu', menuRepositoryGetter);
    this.registerInclusionResolver('menu', this.menu.inclusionResolver);
    this.cover = this.createBelongsToAccessorFor(
      'cover',
      imageRepositoryGetter,
    );
    this.registerInclusionResolver('cover', this.cover.inclusionResolver);
    this.place = this.createBelongsToAccessorFor(
      'place',
      placeRepositoryGetter,
    );
    this.registerInclusionResolver('place', this.place.inclusionResolver);

    (this.modelClass as any).observe('persist', async (ctx: any) => {
      ctx.data.updated_at = new Date();
    });
  }
}
