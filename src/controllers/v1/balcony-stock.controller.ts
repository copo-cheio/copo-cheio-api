import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {Balcony, Stock} from '../../models/v1';
import {BalconyRepository} from '../../repositories/v1';

export class BalconyStockController {
  constructor(
    @repository(BalconyRepository)
    protected balconyRepository: BalconyRepository,
  ) {}

  @get('/balconies/{id}/stocks', {
    responses: {
      '200': {
        description: 'Array of Balcony has many Stock',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Stock)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Stock>,
  ): Promise<Stock[]> {
    return this.balconyRepository.stocks(id).find(filter);
  }

  @post('/balconies/{id}/stocks', {
    responses: {
      '200': {
        description: 'Balcony model instance',
        content: {'application/json': {schema: getModelSchemaRef(Stock)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Balcony.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Stock, {
            title: 'NewStockInBalcony',
            exclude: ['id'],
            optional: ['balconyId'],
          }),
        },
      },
    })
    stock: Omit<Stock, 'id'>,
  ): Promise<Stock> {
    return this.balconyRepository.stocks(id).create(stock);
  }

  @patch('/balconies/{id}/stocks', {
    responses: {
      '200': {
        description: 'Balcony.Stock PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Stock, {partial: true}),
        },
      },
    })
    stock: Partial<Stock>,
    @param.query.object('where', getWhereSchemaFor(Stock)) where?: Where<Stock>,
  ): Promise<Count> {
    return this.balconyRepository.stocks(id).patch(stock, where);
  }

  @del('/balconies/{id}/stocks', {
    responses: {
      '200': {
        description: 'Balcony.Stock DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Stock)) where?: Where<Stock>,
  ): Promise<Count> {
    return this.balconyRepository.stocks(id).delete(where);
  }
}
