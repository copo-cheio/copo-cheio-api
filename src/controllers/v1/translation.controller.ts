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
import {Translation} from '../../models';
import {TranslationRepository} from '../../repositories';

export class TranslationController {
  constructor(
    @repository(TranslationRepository)
    public translationRepository: TranslationRepository,
  ) {}

  @post('/translations')
  @response(200, {
    description: 'Translation model instance',
    content: {'application/json': {schema: getModelSchemaRef(Translation)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          exclude: ['id', 'updated_at', 'created_at'],
          schema: getModelSchemaRef(Translation, {
            title: 'NewTranslation',
            exclude: ['id', 'updated_at', 'created_at'],
          }),
        },
      },
    })
    translation: Omit<Translation, 'id'>,
  ): Promise<Translation> {
    return this.translationRepository.create(translation);
  }

  @get('/translations/count')
  @response(200, {
    description: 'Translation model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Translation) where?: Where<Translation>,
  ): Promise<Count> {
    return this.translationRepository.count(where);
  }

  @get('/translations')
  @response(200, {
    description: 'Array of Translation model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Translation, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Translation) filter?: Filter<Translation>,
  ): Promise<Translation[]> {
    return this.translationRepository.find(filter);
  }

  @patch('/translations')
  @response(200, {
    description: 'Translation PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          exclude: ['id', 'updated_at', 'created_at'],
          schema: getModelSchemaRef(Translation, {partial: true}),
        },
      },
    })
    translation: Translation,
    @param.where(Translation) where?: Where<Translation>,
  ): Promise<Count> {
    return this.translationRepository.updateAll(translation, where);
  }

  @get('/translations/{id}')
  @response(200, {
    description: 'Translation model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Translation, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Translation, {exclude: 'where'})
    filter?: FilterExcludingWhere<Translation>,
  ): Promise<Translation> {
    return this.translationRepository.findById(id, filter);
  }

  @patch('/translations/{id}')
  @response(204, {
    description: 'Translation PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          exclude: ['id', 'updated_at', 'created_at'],
          schema: getModelSchemaRef(Translation, {partial: true}),
        },
      },
    })
    translation: Translation,
  ): Promise<void> {
    await this.translationRepository.updateById(id, translation);
  }

  @put('/translations/{id}')
  @response(204, {
    description: 'Translation PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() translation: Translation,
  ): Promise<void> {
    await this.translationRepository.replaceById(id, translation);
  }

  @del('/translations/{id}')
  @response(204, {
    description: 'Translation DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.translationRepository.deleteById(id);
  }
}
