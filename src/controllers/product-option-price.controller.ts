import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  ProductOption,
  Price,
} from '../models';
import {ProductOptionRepository} from '../repositories';

export class ProductOptionPriceController {
  constructor(
    @repository(ProductOptionRepository)
    public productOptionRepository: ProductOptionRepository,
  ) { }

  @get('/product-options/{id}/price', {
    responses: {
      '200': {
        description: 'Price belonging to ProductOption',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Price),
          },
        },
      },
    },
  })
  async getPrice(
    @param.path.string('id') id: typeof ProductOption.prototype.id,
  ): Promise<Price> {
    return this.productOptionRepository.price(id);
  }
}
