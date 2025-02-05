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
import {FilterByTags} from '../../blueprints/shared/tag.include';
import {Artist} from '../../models/v1';
import {ArtistRepository} from '../../repositories/v1';

export class ArtistController {
  constructor(
    @repository(ArtistRepository)
    public artistRepository: ArtistRepository,
  ) {}

  @post('/artists')
  @response(200, {
    description: 'Artist model instance',
    content: {'application/json': {schema: getModelSchemaRef(Artist)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Artist, {
            title: 'NewArtist',
            exclude: ['id'],
          }),
        },
      },
    })
    artist: Omit<Artist, 'id'>,
  ): Promise<Artist> {
    return this.artistRepository.create(artist);
  }

  @get('/artists/count')
  @response(200, {
    description: 'Artist model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Artist) where?: Where<Artist>): Promise<Count> {
    return this.artistRepository.count(where);
  }

  @get('/artists')
  @response(200, {
    description: 'Array of Artist model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Artist, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Artist) filter?: Filter<Artist>): Promise<Artist[]> {
    return this.artistRepository.find(FilterByTags(filter));
  }

  @patch('/artists')
  @response(200, {
    description: 'Artist PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Artist, {partial: true}),
        },
      },
    })
    artist: Artist,
    @param.where(Artist) where?: Where<Artist>,
  ): Promise<Count> {
    return this.artistRepository.updateAll(artist, where);
  }

  @get('/artists/{id}')
  @response(200, {
    description: 'Artist model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Artist, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Artist, {exclude: 'where'})
    filter?: FilterExcludingWhere<Artist>,
  ): Promise<Artist> {
    return this.artistRepository.findById(id, filter);
  }

  @patch('/artists/{id}')
  @response(204, {
    description: 'Artist PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Artist, {partial: true}),
        },
      },
    })
    artist: Artist,
  ): Promise<void> {
    await this.artistRepository.updateById(id, artist);
  }

  @put('/artists/{id}')
  @response(204, {
    description: 'Artist PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() artist: Artist,
  ): Promise<void> {
    await this.artistRepository.replaceById(id, artist);
  }

  @del('/artists/{id}')
  @response(204, {
    description: 'Artist DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.artistRepository.deleteById(id);
  }
}
