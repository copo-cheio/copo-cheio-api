import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  MenuProduct,
  Product,
} from '../models';
import {MenuProductRepository} from '../repositories';

export class MenuProductProductController {
  constructor(
    @repository(MenuProductRepository)
    public menuProductRepository: MenuProductRepository,
  ) { }

  @get('/menu-products/{id}/product', {
    responses: {
      '200': {
        description: 'Product belonging to MenuProduct',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Product),
          },
        },
      },
    },
  })
  async getProduct(
    @param.path.string('id') id: typeof MenuProduct.prototype.id,
  ): Promise<Product> {
    return this.menuProductRepository.product(id);
  }
}
