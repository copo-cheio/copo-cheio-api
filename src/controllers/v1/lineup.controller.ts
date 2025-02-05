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
import {Lineup} from '../../models/v1';
import {LineupRepository} from '../../repositories/v1';

export class LineupController {
  constructor(
    @repository(LineupRepository)
    public lineupRepository: LineupRepository,
  ) {}

  @post('/lineups')
  @response(200, {
    description: 'Lineup model instance',
    content: {'application/json': {schema: getModelSchemaRef(Lineup)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Lineup, {
            title: 'NewLineup',
            exclude: ['id'],
          }),
        },
      },
    })
    lineup: Omit<Lineup, 'id'>,
  ): Promise<Lineup> {
    return this.lineupRepository.create(lineup);
  }

  @get('/lineups/count')
  @response(200, {
    description: 'Lineup model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Lineup) where?: Where<Lineup>): Promise<Count> {
    return this.lineupRepository.count(where);
  }

  @get('/lineups')
  @response(200, {
    description: 'Array of Lineup model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Lineup, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Lineup) filter?: Filter<Lineup>): Promise<Lineup[]> {
    return this.lineupRepository.find(filter);
  }

  @patch('/lineups')
  @response(200, {
    description: 'Lineup PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Lineup, {partial: true}),
        },
      },
    })
    lineup: Lineup,
    @param.where(Lineup) where?: Where<Lineup>,
  ): Promise<Count> {
    return this.lineupRepository.updateAll(lineup, where);
  }

  @get('/lineups/{id}')
  @response(200, {
    description: 'Lineup model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Lineup, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Lineup, {exclude: 'where'})
    filter?: FilterExcludingWhere<Lineup>,
  ): Promise<Lineup> {
    return this.lineupRepository.findById(id, filter);
  }

  @patch('/lineups/{id}')
  @response(204, {
    description: 'Lineup PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Lineup, {partial: true}),
        },
      },
    })
    lineup: Lineup,
  ): Promise<void> {
    await this.lineupRepository.updateById(id, lineup);
  }

  @put('/lineups/{id}')
  @response(204, {
    description: 'Lineup PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() lineup: Lineup,
  ): Promise<void> {
    await this.lineupRepository.replaceById(id, lineup);
  }

  @del('/lineups/{id}')
  @response(204, {
    description: 'Lineup DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.lineupRepository.deleteById(id);
  }
}
