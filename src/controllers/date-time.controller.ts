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
import { DateTime } from '../models';
import { DateTimeRepository } from '../repositories';

export class DateTimeController {
  constructor(
    @repository(DateTimeRepository)
    public dateTimeRepository : DateTimeRepository,
  ) {}

  @post('/date-times')
  @response(200, {
    description: 'DateTime model instance',
    content: {'application/json': {schema: getModelSchemaRef(DateTime)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          exclude: ["id", "updated_at", "created_at"],
          schema: getModelSchemaRef(DateTime, {
            title: 'NewDateTime',
            exclude: ["id", "updated_at", "created_at"],
          }),
        },
      },
    })
    dateTime: Omit<DateTime, 'id'>,
  ): Promise<DateTime> {
    return this.dateTimeRepository.create(dateTime);
  }

  @get('/date-times/count')
  @response(200, {
    description: 'DateTime model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(DateTime) where?: Where<DateTime>,
  ): Promise<Count> {
    return this.dateTimeRepository.count(where);
  }

  @get('/date-times')
  @response(200, {
    description: 'Array of DateTime model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(DateTime, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(DateTime) filter?: Filter<DateTime>,
  ): Promise<DateTime[]> {
    return this.dateTimeRepository.find(filter);
  }

  @patch('/date-times')
  @response(200, {
    description: 'DateTime PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          exclude: ["id", "updated_at", "created_at"],
          schema: getModelSchemaRef(DateTime, {partial: true}),
        },
      },
    })
    dateTime: DateTime,
    @param.where(DateTime) where?: Where<DateTime>,
  ): Promise<Count> {
    return this.dateTimeRepository.updateAll(dateTime, where);
  }

  @get('/date-times/{id}')
  @response(200, {
    description: 'DateTime model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(DateTime, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(DateTime, {exclude: 'where'}) filter?: FilterExcludingWhere<DateTime>
  ): Promise<DateTime> {
    return this.dateTimeRepository.findById(id, filter);
  }

  @patch('/date-times/{id}')
  @response(204, {
    description: 'DateTime PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          exclude: ["id", "updated_at", "created_at"],
          schema: getModelSchemaRef(DateTime, {partial: true}),
        },
      },
    })
    dateTime: DateTime,
  ): Promise<void> {
    await this.dateTimeRepository.updateById(id, dateTime);
  }

  @put('/date-times/{id}')
  @response(204, {
    description: 'DateTime PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() dateTime: DateTime,
  ): Promise<void> {
    await this.dateTimeRepository.replaceById(id, dateTime);
  }

  @del('/date-times/{id}')
  @response(204, {
    description: 'DateTime DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.dateTimeRepository.deleteById(id);
  }
}
