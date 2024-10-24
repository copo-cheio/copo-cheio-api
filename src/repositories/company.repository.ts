import {Getter,inject} from '@loopback/core';
import {HasOneRepositoryFactory,ReferencesManyAccessor,repository, BelongsToAccessor, HasManyRepositoryFactory} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../datasources';
import {Company,CompanyRelations,Contacts,Staff, Image} from '../models';
import {ContactsRepository} from './contacts.repository';
import {StaffRepository} from './staff.repository';
import {ImageRepository} from './image.repository';

export class CompanyRepository extends SoftCrudRepository<
  Company,
  typeof Company.prototype.id,
  CompanyRelations
> {

  public readonly staffs: ReferencesManyAccessor<Staff, typeof Company.prototype.id>;

  public readonly contacts: HasOneRepositoryFactory<Contacts, typeof Company.prototype.id>;

  public readonly cover: BelongsToAccessor<Image, typeof Company.prototype.id>;

  public readonly staffMembers: HasManyRepositoryFactory<Staff, typeof Company.prototype.id>;

  constructor(
    @inject("datasources.PostgresSql") dataSource: PostgresSqlDataSource, @repository.getter('StaffRepository') protected staffRepositoryGetter: Getter<StaffRepository>, @repository.getter('ContactsRepository') protected contactsRepositoryGetter: Getter<ContactsRepository>, @repository.getter('ImageRepository') protected imageRepositoryGetter: Getter<ImageRepository>,
  ) {
    super(Company, dataSource);
    this.staffMembers = this.createHasManyRepositoryFactoryFor('staffMembers', staffRepositoryGetter,);
    this.registerInclusionResolver('staffMembers', this.staffMembers.inclusionResolver);
    this.cover = this.createBelongsToAccessorFor('cover', imageRepositoryGetter,);
    this.registerInclusionResolver('cover', this.cover.inclusionResolver);
    this.contacts = this.createHasOneRepositoryFactoryFor('contacts', contactsRepositoryGetter);
    this.registerInclusionResolver('contacts', this.contacts.inclusionResolver);
    this.staffs = this.createReferencesManyAccessorFor('staffs', staffRepositoryGetter,);
    this.registerInclusionResolver('staffs', this.staffs.inclusionResolver);
  }
}
