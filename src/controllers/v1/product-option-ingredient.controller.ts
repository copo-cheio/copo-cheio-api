import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Ingredient, ProductOption} from '../../models';
import {ProductOptionRepository} from '../../repositories';

export class ProductOptionIngredientController {
  constructor(
    @repository(ProductOptionRepository)
    public productOptionRepository: ProductOptionRepository,
  ) {}

  @get('/product-options/{id}/ingredient', {
    responses: {
      '200': {
        description: 'Ingredient belonging to ProductOption',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Ingredient),
          },
        },
      },
    },
  })
  async getIngredient(
    @param.path.string('id') id: typeof ProductOption.prototype.id,
  ): Promise<Ingredient> {
    return this.productOptionRepository.ingredient(id);
  }
}
