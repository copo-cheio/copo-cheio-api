import {inject, Getter} from '@loopback/core';

import {PostgresSqlDataSource} from '../datasources';
import {Search,SearchRelations, User} from '../models';
import {BaseRepository} from './base.repository.base';
import {repository, BelongsToAccessor} from '@loopback/repository';
import {UserRepository} from './user.repository';

export class SearchRepository extends BaseRepository<
  Search,
  typeof Search.prototype.id,
  SearchRelations
> {

  public readonly user: BelongsToAccessor<User, typeof Search.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Search, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
