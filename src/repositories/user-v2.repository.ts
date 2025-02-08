import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';

import {UserV2, UserV2Relations} from '../models';

export class UserV2Repository extends DefaultCrudRepository<
  UserV2,
  typeof UserV2.prototype.id,
  UserV2Relations
> {
  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
  ) {
    super(UserV2, dataSource);
  }
}
