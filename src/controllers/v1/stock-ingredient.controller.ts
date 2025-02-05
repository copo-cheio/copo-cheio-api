import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Ingredient, Stock} from '../../models/v1';
import {StockRepository} from '../../repositories/v1';

export class StockIngredientController {
  constructor(
    @repository(StockRepository)
    public stockRepository: StockRepository,
  ) {}

  @get('/stocks/{id}/ingredient', {
    responses: {
      '200': {
        description: 'Ingredient belonging to Stock',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Ingredient),
          },
        },
      },
    },
  })
  async getIngredient(
    @param.path.string('id') id: typeof Stock.prototype.id,
  ): Promise<Ingredient> {
    return this.stockRepository.ingredient(id);
  }
}
