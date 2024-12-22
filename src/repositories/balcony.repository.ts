import {Getter,inject} from "@loopback/core";
import {
  BelongsToAccessor,
  HasManyRepositoryFactory,
  repository
} from "@loopback/repository";
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../datasources';
import {Balcony,BalconyRelations,Image,Menu,Order,Place, Stock} from "../models";
import {ImageRepository} from "./image.repository";
import {MenuRepository} from './menu.repository';
import {OrderRepository} from './order.repository';
import {PlaceRepository} from "./place.repository";
import {StockRepository} from './stock.repository';

export class BalconyRepository extends SoftCrudRepository<
  Balcony,
  typeof Balcony.prototype.id,
  BalconyRelations
> {
  public readonly place: BelongsToAccessor<Place, typeof Balcony.prototype.id>;

  public readonly cover: BelongsToAccessor<Image, typeof Balcony.prototype.id>;

  public readonly menu: BelongsToAccessor<Menu, typeof Balcony.prototype.id>;

  public readonly orders: HasManyRepositoryFactory<Order, typeof Balcony.prototype.id>;

  public readonly stocks: HasManyRepositoryFactory<Stock, typeof Balcony.prototype.id>;

  constructor(
    @inject("datasources.PostgresSql") dataSource: PostgresSqlDataSource,
    @repository.getter("PlaceRepository")
    protected placeRepositoryGetter: Getter<PlaceRepository>,
    @repository.getter("ImageRepository")
    protected imageRepositoryGetter: Getter<ImageRepository>, @repository.getter('MenuRepository') protected menuRepositoryGetter: Getter<MenuRepository>, @repository.getter('OrderRepository') protected orderRepositoryGetter: Getter<OrderRepository>, @repository.getter('StockRepository') protected stockRepositoryGetter: Getter<StockRepository>,
  ) {
    super(Balcony, dataSource);
    this.stocks = this.createHasManyRepositoryFactoryFor('stocks', stockRepositoryGetter,);
    this.registerInclusionResolver('stocks', this.stocks.inclusionResolver);
    this.orders = this.createHasManyRepositoryFactoryFor('orders', orderRepositoryGetter,);
    this.registerInclusionResolver('orders', this.orders.inclusionResolver);
    this.menu = this.createBelongsToAccessorFor('menu', menuRepositoryGetter,);
    this.registerInclusionResolver('menu', this.menu.inclusionResolver);
    this.cover = this.createBelongsToAccessorFor(
      "cover",
      imageRepositoryGetter
    );
    this.registerInclusionResolver("cover", this.cover.inclusionResolver);
    this.place = this.createBelongsToAccessorFor(
      "place",
      placeRepositoryGetter
    );
    this.registerInclusionResolver("place", this.place.inclusionResolver);

    (this.modelClass as any).observe("persist", async (ctx: any) => {
      ctx.data.updated_at = new Date();
    });
  }
}
