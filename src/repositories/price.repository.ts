import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {SqliteDbDataSource} from '../datasources';
import {Price, PriceRelations, Currency} from '../models';
import {CurrencyRepository} from './currency.repository';

export class PriceRepository extends DefaultCrudRepository<
  Price,
  typeof Price.prototype.id,
  PriceRelations
> {

  public readonly currency: BelongsToAccessor<Currency, typeof Price.prototype.id>;

  constructor(
    @inject('datasources.SqliteDb') dataSource: SqliteDbDataSource, @repository.getter('CurrencyRepository') protected currencyRepositoryGetter: Getter<CurrencyRepository>,
  ) {
    super(Price, dataSource);
    this.currency = this.createBelongsToAccessorFor('currency', currencyRepositoryGetter,);
    this.registerInclusionResolver('currency', this.currency.inclusionResolver);
  }
}
