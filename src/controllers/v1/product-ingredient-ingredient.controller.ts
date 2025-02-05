import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Ingredient, ProductIngredient} from '../../models/v1';
import {ProductIngredientRepository} from '../../repositories/v1';

export class ProductIngredientIngredientController {
  constructor(
    @repository(ProductIngredientRepository)
    public productIngredientRepository: ProductIngredientRepository,
  ) {}

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
