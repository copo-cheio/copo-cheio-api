import {inject} from '@loopback/core';
import {PostgresSqlDataSource} from '../datasources';

import {OrderItemsV2, OrderItemsV2Relations} from '../models';
import {BaseRepository} from './v1';

export class OrderItemsV2Repository extends BaseRepository<
  OrderItemsV2,
  typeof OrderItemsV2.prototype.id,
  OrderItemsV2Relations
> {
  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
  ) {
    super(OrderItemsV2, dataSource);
  }
}
