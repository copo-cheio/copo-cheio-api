import {Getter,inject} from '@loopback/core';
import {DefaultCrudRepository,HasManyRepositoryFactory,repository} from '@loopback/repository';
import {SqliteDbDataSource} from '../datasources';
import {Country,CountryRelations,Region} from '../models';
import {RegionRepository} from './region.repository';

export class CountryRepository extends DefaultCrudRepository<
  Country,
  typeof Country.prototype.id,
  CountryRelations
> {

  public readonly regions: HasManyRepositoryFactory<Region, typeof Country.prototype.id>;

  constructor(
    @inject('datasources.SqliteDb') dataSource: SqliteDbDataSource, @repository.getter('RegionRepository') protected regionRepositoryGetter: Getter<RegionRepository>,
  ) {
    super(Country, dataSource);
    this.regions = this.createHasManyRepositoryFactoryFor('regions', regionRepositoryGetter,);
    this.registerInclusionResolver('regions', this.regions.inclusionResolver);

    (this.modelClass as any).observe("persist", async (ctx: any) => {
      ctx.data.updated_at = new Date();
    });
  }
}
