import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Product,
  Company,
} from '../models';
import {ProductRepository} from '../repositories';

export class ProductCompanyController {
  constructor(
    @repository(ProductRepository)
    public productRepository: ProductRepository,
  ) { }

  @get('/products/{id}/company', {
    responses: {
      '200': {
        description: 'Company belonging to Product',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Company),
          },
        },
      },
    },
  })
  async getCompany(
    @param.path.string('id') id: typeof Product.prototype.id,
  ): Promise<Company> {
    return this.productRepository.company(id);
  }
}
