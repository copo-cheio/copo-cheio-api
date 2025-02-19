import {Getter, inject} from '@loopback/core';

import {repository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {ActivityV2, ActivityV2Relations} from '../models';
import {BaseRepository} from './base.repository.base';
import {UserRepository} from './v1';

export class ActivityV2Repository extends BaseRepository<
  ActivityV2,
  typeof ActivityV2.prototype.id,
  ActivityV2Relations
> {
  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(ActivityV2, dataSource);
  }
}
