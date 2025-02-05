import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../../datasources';
import {Address, AddressRelations, Country, Region} from '../../models/v1';
import {CountryRepository} from './country.repository';
import {RegionRepository} from './region.repository';

export class AddressRepository extends SoftCrudRepository<
  Address,
  typeof Address.prototype.id,
  AddressRelations
> {
  public readonly region: BelongsToAccessor<
    Region,
    typeof Address.prototype.id
  >;

  public readonly country: BelongsToAccessor<
    Country,
    typeof Address.prototype.id
  >;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('RegionRepository')
    protected regionRepositoryGetter: Getter<RegionRepository>,
    @repository.getter('CountryRepository')
    protected countryRepositoryGetter: Getter<CountryRepository>,
  ) {
    super(Address, dataSource);
    this.country = this.createBelongsToAccessorFor(
      'country',
      countryRepositoryGetter,
    );
    this.registerInclusionResolver('country', this.country.inclusionResolver);
    this.region = this.createBelongsToAccessorFor(
      'region',
      regionRepositoryGetter,
    );
    this.registerInclusionResolver('region', this.region.inclusionResolver);

    (this.modelClass as any).observe('persist', async (ctx: any) => {
      ctx.data.updated_at = new Date();
    });
  }
}
