import {Getter, inject} from '@loopback/core';

import {BelongsToAccessor, repository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../../datasources';
import {Search, SearchRelations, User} from '../../models/v1';
import {BaseRepository} from './base.repository.base';
import {UserRepository} from './user.repository';

export class SearchRepository extends BaseRepository<
  Search,
  typeof Search.prototype.id,
  SearchRelations
> {
  public readonly user: BelongsToAccessor<User, typeof Search.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Search, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
