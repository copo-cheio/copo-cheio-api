import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';

import {CheckInV2, CheckInV2Relations} from '../models';

export class CheckInV2Repository extends DefaultCrudRepository<
  CheckInV2,
  typeof CheckInV2.prototype.id,
  CheckInV2Relations
> {
  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
  ) {
    super(CheckInV2, dataSource);
  }
}
