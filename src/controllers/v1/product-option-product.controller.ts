import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Product, ProductOption} from '../../models/v1';
import {ProductOptionRepository} from '../../repositories/v1';

export class ProductOptionProductController {
  constructor(
    @repository(ProductOptionRepository)
    public productOptionRepository: ProductOptionRepository,
  ) {}

  @get('/product-options/{id}/product', {
    responses: {
      '200': {
        description: 'Product belonging to ProductOption',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Product),
          },
        },
      },
    },
  })
  async getProduct(
    @param.path.string('id') id: typeof ProductOption.prototype.id,
  ): Promise<Product> {
    return this.productOptionRepository.product(id);
  }
}
