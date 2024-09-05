import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Ingredient,
  Image,
} from '../models';
import {IngredientRepository} from '../repositories';

export class IngredientImageController {
  constructor(
    @repository(IngredientRepository)
    public ingredientRepository: IngredientRepository,
  ) { }

  @get('/ingredients/{id}/image', {
    responses: {
      '200': {
        description: 'Image belonging to Ingredient',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Image),
          },
        },
      },
    },
  })
  async getImage(
    @param.path.string('id') id: typeof Ingredient.prototype.id,
  ): Promise<Image> {
    return this.ingredientRepository.thumbnail(id);
  }
}
