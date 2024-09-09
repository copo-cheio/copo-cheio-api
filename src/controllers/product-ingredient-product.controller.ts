import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  ProductIngredient,
  Product,
} from '../models';
import {ProductIngredientRepository} from '../repositories';

export class ProductIngredientProductController {
  constructor(
    @repository(ProductIngredientRepository)
    public productIngredientRepository: ProductIngredientRepository,
  ) { }

  @get('/product-ingredients/{id}/product', {
    responses: {
      '200': {
        description: 'Product belonging to ProductIngredient',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Product),
          },
        },
      },
    },
  })
  async getProduct(
    @param.path.string('id') id: typeof ProductIngredient.prototype.id,
  ): Promise<Product> {
    return this.productIngredientRepository.product(id);
  }
}
