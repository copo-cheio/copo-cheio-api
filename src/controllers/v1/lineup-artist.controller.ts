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
import {LineUpArtist} from '../../models';
import {LineUpArtistRepository} from '../../repositories';

export class LineupArtistController {
  constructor(
    @repository(LineUpArtistRepository)
    public lineUpArtistRepository: LineUpArtistRepository,
  ) {}

  @post('/line-up-artists')
  @response(200, {
    description: 'LineUpArtist model instance',
    content: {'application/json': {schema: getModelSchemaRef(LineUpArtist)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(LineUpArtist, {
            title: 'NewLineUpArtist',
            exclude: ['id'],
          }),
        },
      },
    })
    lineUpArtist: Omit<LineUpArtist, 'id'>,
  ): Promise<LineUpArtist> {
    return this.lineUpArtistRepository.create(lineUpArtist);
  }

  @get('/line-up-artists/count')
  @response(200, {
    description: 'LineUpArtist model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(LineUpArtist) where?: Where<LineUpArtist>,
  ): Promise<Count> {
    return this.lineUpArtistRepository.count(where);
  }

  @get('/line-up-artists')
  @response(200, {
    description: 'Array of LineUpArtist model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(LineUpArtist, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(LineUpArtist) filter?: Filter<LineUpArtist>,
  ): Promise<LineUpArtist[]> {
    return this.lineUpArtistRepository.find(filter);
  }

  @patch('/line-up-artists')
  @response(200, {
    description: 'LineUpArtist PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(LineUpArtist, {partial: true}),
        },
      },
    })
    lineUpArtist: LineUpArtist,
    @param.where(LineUpArtist) where?: Where<LineUpArtist>,
  ): Promise<Count> {
    return this.lineUpArtistRepository.updateAll(lineUpArtist, where);
  }

  @get('/line-up-artists/{id}')
  @response(200, {
    description: 'LineUpArtist model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(LineUpArtist, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(LineUpArtist, {exclude: 'where'})
    filter?: FilterExcludingWhere<LineUpArtist>,
  ): Promise<LineUpArtist> {
    return this.lineUpArtistRepository.findById(id, filter);
  }

  @patch('/line-up-artists/{id}')
  @response(204, {
    description: 'LineUpArtist PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(LineUpArtist, {partial: true}),
        },
      },
    })
    lineUpArtist: LineUpArtist,
  ): Promise<void> {
    await this.lineUpArtistRepository.updateById(id, lineUpArtist);
  }

  @put('/line-up-artists/{id}')
  @response(204, {
    description: 'LineUpArtist PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() lineUpArtist: LineUpArtist,
  ): Promise<void> {
    await this.lineUpArtistRepository.replaceById(id, lineUpArtist);
  }

  @del('/line-up-artists/{id}')
  @response(204, {
    description: 'LineUpArtist DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.lineUpArtistRepository.deleteById(id);
  }
}
