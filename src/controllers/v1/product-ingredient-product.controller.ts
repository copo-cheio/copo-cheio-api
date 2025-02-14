import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Product, ProductIngredient} from '../../models';
import {ProductIngredientRepository} from '../../repositories';

export class ProductIngredientProductController {
  constructor(
    @repository(ProductIngredientRepository)
    public productIngredientRepository: ProductIngredientRepository,
  ) {}

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
