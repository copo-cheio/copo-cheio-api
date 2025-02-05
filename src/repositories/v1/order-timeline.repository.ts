import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../../datasources';
import {
  Order,
  OrderTimeline,
  OrderTimelineRelations,
  User,
} from '../../models/v1';
import {OrderRepository} from './order.repository';
import {UserRepository} from './user.repository';

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

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('OrderRepository')
    protected orderRepositoryGetter: Getter<OrderRepository>,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(OrderTimeline, dataSource);
    this.staff = this.createBelongsToAccessorFor('staff', userRepositoryGetter);
    this.registerInclusionResolver('staff', this.staff.inclusionResolver);
    this.order = this.createBelongsToAccessorFor(
      'order',
      orderRepositoryGetter,
    );
    this.registerInclusionResolver('order', this.order.inclusionResolver);
  }
}
