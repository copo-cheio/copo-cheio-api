import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {OrderRepository, UserRepository} from '.';
import {PostgresSqlDataSource} from '../../datasources';
import {
  Order,
  OrderTimeline,
  OrderTimelineRelations,
  OrderV2,
  User,
} from '../../models';
import {OrderV2Repository} from '../order-v2.repository';

export class OrderTimelineRepository extends SoftCrudRepository<
  OrderTimeline,
  typeof OrderTimeline.prototype.id,
  OrderTimelineRelations
> {
  public readonly order: BelongsToAccessor<
    Order,
    typeof OrderTimeline.prototype.id
  >;

  public readonly staff: BelongsToAccessor<
    User,
    typeof OrderTimeline.prototype.id
  >;

  public readonly orderV2: BelongsToAccessor<
    OrderV2,
    typeof OrderTimeline.prototype.id
  >;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('OrderRepository')
    protected orderRepositoryGetter: Getter<OrderRepository>,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('OrderV2Repository')
    protected orderV2RepositoryGetter: Getter<OrderV2Repository>,
  ) {
    super(OrderTimeline, dataSource);
    this.orderV2 = this.createBelongsToAccessorFor(
      'orderV2',
      orderV2RepositoryGetter,
    );
    this.registerInclusionResolver('orderV2', this.orderV2.inclusionResolver);
    this.staff = this.createBelongsToAccessorFor('staff', userRepositoryGetter);
    this.registerInclusionResolver('staff', this.staff.inclusionResolver);
    this.order = this.createBelongsToAccessorFor(
      'order',
      orderRepositoryGetter,
    );
    this.registerInclusionResolver('order', this.order.inclusionResolver);
  }
}
