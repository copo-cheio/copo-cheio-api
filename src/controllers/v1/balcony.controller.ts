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
import {BalconyFullQuery} from '../../blueprints/balcony.blueprint';

import {Balcony} from '../../models';
import {BalconyRepository, DevRepository} from '../../repositories';

export class BalconyController {
  constructor(
    @repository(BalconyRepository)
    public balconyRepository: BalconyRepository,
    @repository(DevRepository)
    public devRepository: DevRepository,
  ) {}

  @get('/balconies/{id}/full')
  @response(200, {
    description: 'Balcony model instance with all dependencies',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Balcony, {includeRelations: true}),
      },
    },
  })
  async findByIdFull(
    @param.path.string('id') id: string,
    @param.filter(Balcony, {exclude: 'where'})
    filter?: FilterExcludingWhere<Balcony>,
  ): Promise<Balcony> {
    // console.log(JSON.stringify(filter),"filter",JSON.stringify(BalconyFullQuery))
    return this.balconyRepository.findById(id, BalconyFullQuery);
  }

  @post('/balconies')
  @response(200, {
    description: 'Balcony model instance',
    content: {'application/json': {schema: getModelSchemaRef(Balcony)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          exclude: ['id', 'updated_at', 'created_at'],
          schema: getModelSchemaRef(Balcony, {
            title: 'NewBalcony',
          }),
        },
      },
    })
    balcony: Omit<Balcony, 'id'>,
  ): Promise<Balcony> {
    const b: any = await this.balconyRepository.create(balcony);
    await this.devRepository.migrate(b.id);
    return b;
  }

  @get('/balconies/count')
  @response(200, {
    description: 'Balcony model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Balcony) where?: Where<Balcony>): Promise<Count> {
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
    return this.balconyRepository.find(BalconyFullQuery);
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
          exclude: ['id', 'updated_at', 'created_at'],
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
    @param.filter(Balcony) filter?: any,
    /*   @param.filter(Balcony, {exclude: 'where'}) filter?: FilterExcludingWhere<Balcony> */
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
          exclude: ['id', 'updated_at', 'created_at'],
          schema: getModelSchemaRef(Balcony, {partial: true}),
        },
      },
    })
    balcony: Balcony,
  ): Promise<void> {
    const response: any = await this.balconyRepository.updateById(id, balcony);

    await this.devRepository.migrate(id);
    return response;
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
