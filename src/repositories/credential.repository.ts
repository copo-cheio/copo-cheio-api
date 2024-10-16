import {Getter,inject} from '@loopback/core';
import {BelongsToAccessor,repository} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../datasources';
import {Credential,CredentialRelations,User} from '../models';
import {UserRepository} from './user.repository';

export class CredentialRepository extends SoftCrudRepository<
  Credential,
  typeof Credential.prototype.id,
  CredentialRelations
> {

  public readonly user: BelongsToAccessor<User, typeof Credential.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Credential, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
