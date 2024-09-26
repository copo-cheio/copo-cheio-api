import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {OrderTimeline,OrderTimelineRelations, Order, User} from '../models';
import {OrderRepository} from './order.repository';
import {UserRepository} from './user.repository';

export class OrderTimelineRepository extends DefaultCrudRepository<
  OrderTimeline,
  typeof OrderTimeline.prototype.id,
  OrderTimelineRelations
> {

  public readonly order: BelongsToAccessor<Order, typeof OrderTimeline.prototype.id>;

  public readonly staff: BelongsToAccessor<User, typeof OrderTimeline.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('OrderRepository') protected orderRepositoryGetter: Getter<OrderRepository>, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(OrderTimeline, dataSource);
    this.staff = this.createBelongsToAccessorFor('staff', userRepositoryGetter,);
    this.registerInclusionResolver('staff', this.staff.inclusionResolver);
    this.order = this.createBelongsToAccessorFor('order', orderRepositoryGetter,);
    this.registerInclusionResolver('order', this.order.inclusionResolver);
  }
}
