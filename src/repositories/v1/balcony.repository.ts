import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';

import {PostgresSqlDataSource} from '../../datasources';
import {
  Balcony,
  BalconyRelations,
  CheckInV2,
  Image,
  Menu,
  Order,
  ORDER_BALCONY_STATUS,
  OrderV2,
  Place,
  Stock,
} from '../../models';
import {CheckInV2Repository} from '../check-in-v2.repository';
import {
  OrderV2Queries,
  OrderV2Repository,
  OrderV2Transformers,
} from '../order-v2.repository';
import {ImageRepository} from './image.repository';
import {MenuRepository} from './menu.repository';
import {OrderRepository} from './order.repository';
import {PlaceRepository} from './place.repository';
import {StockRepository} from './stock.repository';

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

  public readonly checkInsV2: HasManyRepositoryFactory<
    CheckInV2,
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
    @repository.getter('CheckInV2Repository')
    protected checkInV2RepositoryGetter: Getter<CheckInV2Repository>,
  ) {
    super(Balcony, dataSource);
    this.checkInsV2 = this.createHasManyRepositoryFactoryFor(
      'checkInsV2',
      checkInV2RepositoryGetter,
    );
    this.registerInclusionResolver(
      'checkInsV2',
      this.checkInsV2.inclusionResolver,
    );
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

export const BalconyQueries: any = {
  staffOrdersPage: {
    include: [
      {
        relation: 'ordersV2',
        scope: {
          ...OrderV2Queries.full,
          where: {
            ...OrderV2Queries.full.where,
            status: {inq: ORDER_BALCONY_STATUS},
            created_at: {gt: new Date(Date.now() - 24 * 60 * 60 * 1000)},
          },
        },
      },
    ],
  },
  staffCheckInOrdersPage(placeInstanceId) {
    return {
      include: [
        {
          relation: 'ordersV2',
          scope: {
            ...OrderV2Queries.full,
            where: {
              ...OrderV2Queries.full.where,
              placeInstanceId: placeInstanceId,
              status: {inq: ORDER_BALCONY_STATUS},
              created_at: {gt: new Date(Date.now() - 24 * 60 * 60 * 1000)},
            },
          },
        },
      ],
    };
  },
};

export const BalconyTransformers: any = {
  staffOrdersPage: (data: any = {}) => {
    const transformer = (item: any = {}) => {
      return {
        ...item,
        orders: item?.ordersV2 ? OrderV2Transformers.full(item.ordersV2) : [],
      };
    };
    return Array.isArray(data) ? data.map(transformer) : transformer(data);
  },
  staffOrdersWithMap(data: any = {}, userId: string) {
    data = BalconyTransformers.staffOrdersPage(data);
    data.orderMap = {};
    for (const status of ORDER_BALCONY_STATUS) {
      data.orderMap[status] = [];
    }

    for (const order of data.orders) {
      const status = order.status;
      if (data.orderMap[status]) {
        const timeline = order?.timeline || [];
        const isMine = timeline.find((t: any) => t.staffId == userId);
        order.isMine = isMine ? true : false;

        data.orderMap[status].push(order);
      }
    }
    data.orderMap.COMPLETE = data.orderMap.COMPLETE || [];
    data.orderMap.COMPLETE.sort((a, b) =>
      new Date(a.updated_at) > new Date(b.updated_at) ? -1 : 1,
    );
    data.orderMap.READY = data.orderMap.READY || [];
    data.orderMap.READY.sort((a, b) =>
      new Date(a.updated_at) > new Date(b.updated_at) ? -1 : 1,
    );

    return data;
  },
};
