import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Balcony, Stock} from '../../models/v1';
import {StockRepository} from '../../repositories/v1';

export class StockBalconyController {
  constructor(
    @repository(StockRepository)
    public stockRepository: StockRepository,
  ) {}

  @get('/stocks/{id}/balcony', {
    responses: {
      '200': {
        description: 'Balcony belonging to Stock',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Balcony),
          },
        },
      },
    },
  })
  async getBalcony(
    @param.path.string('id') id: typeof Stock.prototype.id,
  ): Promise<Balcony> {
    return this.stockRepository.balcony(id);
  }
}
