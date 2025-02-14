import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {Price} from '../../models';
import {PriceRepository} from '../../repositories';

export class PriceController {
  constructor(
    @repository(PriceRepository)
    public priceRepository: PriceRepository,
  ) {}

  @post('/prices')
  @response(200, {
    description: 'Price model instance',
    content: {'application/json': {schema: getModelSchemaRef(Price)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Price, {
            title: 'NewPrice',
            exclude: ['id', 'updated_at', 'created_at'],
          }),
        },
      },
    })
    price: Omit<Price, 'id'>,
  ): Promise<Price> {
    return this.priceRepository.create(price);
  }

  @get('/prices/count')
  @response(200, {
    description: 'Price model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Price) where?: Where<Price>): Promise<Count> {
    return this.priceRepository.count(where);
  }

  @get('/prices')
  @response(200, {
    description: 'Array of Price model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Price, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Price) filter?: Filter<Price>): Promise<Price[]> {
    return this.priceRepository.find(filter);
  }

  @patch('/prices')
  @response(200, {
    description: 'Price PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Price, {partial: true}),
        },
      },
    })
    price: Price,
    @param.where(Price) where?: Where<Price>,
  ): Promise<Count> {
    return this.priceRepository.updateAll(price, where);
  }

  @get('/prices/{id}')
  @response(200, {
    description: 'Price model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Price, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Price, {exclude: 'where'})
    filter?: FilterExcludingWhere<Price>,
  ): Promise<Price> {
    return this.priceRepository.findById(id, filter);
  }

  @patch('/prices/{id}')
  @response(204, {
    description: 'Price PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Price, {partial: true}),
        },
      },
    })
    price: Price,
  ): Promise<void> {
    await this.priceRepository.updateById(id, price);
  }

  @put('/prices/{id}')
  @response(204, {
    description: 'Price PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() price: Price,
  ): Promise<void> {
    await this.priceRepository.replaceById(id, price);
  }

  @del('/prices/{id}')
  @response(204, {
    description: 'Price DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.priceRepository.deleteById(id);
  }
}
