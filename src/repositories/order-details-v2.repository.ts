import {inject} from '@loopback/core';
import {PostgresSqlDataSource} from '../datasources';

import {OrderDetailsV2, OrderDetailsV2Relations} from '../models';
import {BaseRepository} from './v1';

export class OrderDetailsV2Repository extends BaseRepository<
  OrderDetailsV2,
  typeof OrderDetailsV2.prototype.id,
  OrderDetailsV2Relations
> {
  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
  ) {
    super(OrderDetailsV2, dataSource);
  }
}
