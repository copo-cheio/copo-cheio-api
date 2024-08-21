import {Getter,inject} from '@loopback/core';
import {BelongsToAccessor,DefaultCrudRepository,repository} from '@loopback/repository';
import {SqliteDbDataSource} from '../datasources';
import {Country,Region,RegionRelations} from '../models';
import {CountryRepository} from './country.repository';

export class RegionRepository extends DefaultCrudRepository<
  Region,
  typeof Region.prototype.id,
  RegionRelations
> {

  public readonly country: BelongsToAccessor<Country, typeof Region.prototype.id>;

  constructor(
    @inject('datasources.SqliteDb') dataSource: SqliteDbDataSource, @repository.getter('CountryRepository') protected countryRepositoryGetter: Getter<CountryRepository>,
  ) {
    super(Region, dataSource);
    this.country = this.createBelongsToAccessorFor('country', countryRepositoryGetter,);
    this.registerInclusionResolver('country', this.country.inclusionResolver);

    (this.modelClass as any).observe("persist", async (ctx: any) => {
      ctx.data.updated_at = new Date();
    });
  }
}
