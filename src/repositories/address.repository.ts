import {Getter,inject} from '@loopback/core';
import {BelongsToAccessor,DefaultCrudRepository,repository} from '@loopback/repository';
import {SqliteDbDataSource} from '../datasources';
import {Address,AddressRelations,Region, Country} from '../models';
import {RegionRepository} from './region.repository';
import {CountryRepository} from './country.repository';

export class AddressRepository extends DefaultCrudRepository<
  Address,
  typeof Address.prototype.id,
  AddressRelations
> {

  public readonly region: BelongsToAccessor<Region, typeof Address.prototype.id>;

  public readonly country: BelongsToAccessor<Country, typeof Address.prototype.id>;

  constructor(
    @inject('datasources.SqliteDb') dataSource: SqliteDbDataSource, @repository.getter('RegionRepository') protected regionRepositoryGetter: Getter<RegionRepository>, @repository.getter('CountryRepository') protected countryRepositoryGetter: Getter<CountryRepository>,
  ) {
    super(Address, dataSource);
    this.country = this.createBelongsToAccessorFor('country', countryRepositoryGetter,);
    this.registerInclusionResolver('country', this.country.inclusionResolver);
    this.region = this.createBelongsToAccessorFor('region', regionRepositoryGetter,);
    this.registerInclusionResolver('region', this.region.inclusionResolver);

    (this.modelClass as any).observe("persist", async (ctx: any) => {
      console.log('ADREESSSS')
      console.log({ctx})
      ctx.data.updated_at = new Date();
    });
  }
}
