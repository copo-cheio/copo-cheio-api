import {Getter, inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {Dev, DevRelations} from '../models';
import {BaseRepository} from './base.repository.base';
import {UserRepository} from './user.repository';

export class DevRepository extends BaseRepository<
  Dev,
  typeof Dev.prototype.id,
  DevRelations
> {
  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Dev, dataSource);
  }
}
