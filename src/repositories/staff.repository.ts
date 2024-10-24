import {Getter,inject} from '@loopback/core';
import {BelongsToAccessor,repository} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../datasources';
import {Staff,StaffRelations,User, Company} from '../models';
import {UserRepository} from './user.repository';
import {CompanyRepository} from './company.repository';

export class StaffRepository extends SoftCrudRepository<
  Staff,
  typeof Staff.prototype.id,
  StaffRelations
> {

  public readonly user: BelongsToAccessor<User, typeof Staff.prototype.id>;

  public readonly company: BelongsToAccessor<Company, typeof Staff.prototype.id>;

  constructor(
    @inject("datasources.PostgresSql") dataSource: PostgresSqlDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('CompanyRepository') protected companyRepositoryGetter: Getter<CompanyRepository>,
  ) {
    super(Staff, dataSource);
    this.company = this.createBelongsToAccessorFor('company', companyRepositoryGetter,);
    this.registerInclusionResolver('company', this.company.inclusionResolver);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
