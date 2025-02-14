import {Getter, inject} from '@loopback/core';
import {PostgresSqlDataSource} from '../datasources';

import {BelongsToAccessor, repository} from '@loopback/repository';
import {OrderDetailsV2, OrderDetailsV2Relations, OrderV2} from '../models';
import {BaseRepository} from './base.repository.base';
import {OrderV2Repository} from './order-v2.repository';

export class OrderDetailsV2Repository extends BaseRepository<
  OrderDetailsV2,
  typeof OrderDetailsV2.prototype.id,
  OrderDetailsV2Relations
> {
  public readonly orderV2: BelongsToAccessor<
    OrderV2,
    typeof OrderDetailsV2.prototype.id
  >;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('OrderV2Repository')
    protected orderV2RepositoryGetter: Getter<OrderV2Repository>,
  ) {
    super(OrderDetailsV2, dataSource);
    this.orderV2 = this.createBelongsToAccessorFor(
      'orderV2',
      orderV2RepositoryGetter,
    );
    this.registerInclusionResolver('orderV2', this.orderV2.inclusionResolver);
  }
}
