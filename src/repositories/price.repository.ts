import {Getter,inject} from '@loopback/core';
import {BelongsToAccessor,DefaultCrudRepository,repository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {Currency,Price,PriceRelations} from '../models';
import {CurrencyRepository} from './currency.repository';

export class PriceRepository extends DefaultCrudRepository<
  Price,
  typeof Price.prototype.id,
  PriceRelations
> {

  public readonly currency: BelongsToAccessor<Currency, typeof Price.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('CurrencyRepository') protected currencyRepositoryGetter: Getter<CurrencyRepository>,
  ) {
    super(Price, dataSource);
    this.currency = this.createBelongsToAccessorFor('currency', currencyRepositoryGetter,);
    this.registerInclusionResolver('currency', this.currency.inclusionResolver);
  }
}
