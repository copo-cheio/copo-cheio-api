import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Stock,
  Balcony,
} from '../models';
import {StockRepository} from '../repositories';

export class StockBalconyController {
  constructor(
    @repository(StockRepository)
    public stockRepository: StockRepository,
  ) { }

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
