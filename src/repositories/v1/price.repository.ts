import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {DEFAULT_MODEL_ID} from '../../constants';
import {PostgresSqlDataSource} from '../../datasources';
import {Currency, Price, PriceRelations} from '../../models';
import {validateUuid} from '../../utils/validations';
import {CurrencyRepository} from './currency.repository';

export class PriceRepository extends SoftCrudRepository<
  Price,
  typeof Price.prototype.id,
  PriceRelations
> {
  public readonly currency: BelongsToAccessor<
    Currency,
    typeof Price.prototype.id
  >;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('CurrencyRepository')
    protected currencyRepositoryGetter: Getter<CurrencyRepository>,
  ) {
    super(Price, dataSource);
    this.currency = this.createBelongsToAccessorFor(
      'currency',
      currencyRepositoryGetter,
    );
    this.registerInclusionResolver('currency', this.currency.inclusionResolver);
  }

  async updateOrCreateById(id: string, payload: any = {}, options: any = {}) {
    let record: any;
    payload = {
      price: payload.price || '0,00',
      currencyId: payload.currencyId || DEFAULT_MODEL_ID.currencyId,
    };
    if (id && validateUuid(id, '').valid) {
      record = await this.updateById(id, payload, options);
    } else {
      record = await this.create(payload, options);
      id = record.id;
    }

    return this.findById(id, {include: [{relation: 'currency'}]});
  }
}
