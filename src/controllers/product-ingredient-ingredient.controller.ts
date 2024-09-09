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
  Ingredient,
} from '../models';
import {ProductIngredientRepository} from '../repositories';

export class ProductIngredientIngredientController {
  constructor(
    @repository(ProductIngredientRepository)
    public productIngredientRepository: ProductIngredientRepository,
  ) { }

  @get('/product-ingredients/{id}/ingredient', {
    responses: {
      '200': {
        description: 'Ingredient belonging to ProductIngredient',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Ingredient),
          },
        },
      },
    },
  })
  async getIngredient(
    @param.path.string('id') id: typeof ProductIngredient.prototype.id,
  ): Promise<Ingredient> {
    return this.productIngredientRepository.ingredient(id);
  }
}
