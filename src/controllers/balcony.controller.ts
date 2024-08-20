import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Balcony} from '../models';
import {BalconyRepository} from '../repositories';

export class BalconyController {
  constructor(
    @repository(BalconyRepository)
    public balconyRepository : BalconyRepository,
  ) {}

  @post('/balconies')
  @response(200, {
    description: 'Balcony model instance',
    content: {'application/json': {schema: getModelSchemaRef(Balcony)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Balcony, {
            title: 'NewBalcony',
            exclude: ['id'],
          }),
        },
      },
    })
    balcony: Omit<Balcony, 'id'>,
  ): Promise<Balcony> {
    return this.balconyRepository.create(balcony);
  }

  @get('/balconies/count')
  @response(200, {
    description: 'Balcony model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Balcony) where?: Where<Balcony>,
  ): Promise<Count> {
    return this.balconyRepository.count(where);
  }

  @get('/balconies')
  @response(200, {
    description: 'Array of Balcony model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Balcony, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Balcony) filter?: Filter<Balcony>,
  ): Promise<Balcony[]> {
    return this.balconyRepository.find(filter);
  }

  @patch('/balconies')
  @response(200, {
    description: 'Balcony PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Balcony, {partial: true}),
        },
      },
    })
    balcony: Balcony,
    @param.where(Balcony) where?: Where<Balcony>,
  ): Promise<Count> {
    return this.balconyRepository.updateAll(balcony, where);
  }

  @get('/balconies/{id}')
  @response(200, {
    description: 'Balcony model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Balcony, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Balcony, {exclude: 'where'}) filter?: FilterExcludingWhere<Balcony>
  ): Promise<Balcony> {
    return this.balconyRepository.findById(id, filter);
  }

  @patch('/balconies/{id}')
  @response(204, {
    description: 'Balcony PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Balcony, {partial: true}),
        },
      },
    })
    balcony: Balcony,
  ): Promise<void> {
    await this.balconyRepository.updateById(id, balcony);
  }

  @put('/balconies/{id}')
  @response(204, {
    description: 'Balcony PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() balcony: Balcony,
  ): Promise<void> {
    await this.balconyRepository.replaceById(id, balcony);
  }

  @del('/balconies/{id}')
  @response(204, {
    description: 'Balcony DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.balconyRepository.deleteById(id);
  }
}
