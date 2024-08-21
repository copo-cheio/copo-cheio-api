import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Price,
  Currency,
} from '../models';
import {PriceRepository} from '../repositories';

export class PriceCurrencyController {
  constructor(
    @repository(PriceRepository)
    public priceRepository: PriceRepository,
  ) { }

  @get('/prices/{id}/currency', {
    responses: {
      '200': {
        description: 'Currency belonging to Price',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Currency),
          },
        },
      },
    },
  })
  async getCurrency(
    @param.path.string('id') id: typeof Price.prototype.id,
  ): Promise<Currency> {
    return this.priceRepository.currency(id);
  }
}
