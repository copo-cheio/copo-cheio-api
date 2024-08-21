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
import {
    DateTime,
    Schedule,
} from '../models';
import { ScheduleRepository } from '../repositories';

export class ScheduleDateTimeController {
  constructor(
    @repository(ScheduleRepository) protected scheduleRepository: ScheduleRepository,
  ) { }

  @get('/schedules/{id}/date-times', {
    responses: {
      '200': {
        description: 'Array of Schedule has many DateTime',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(DateTime)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<DateTime>,
  ): Promise<DateTime[]> {
    return this.scheduleRepository.dateTimes(id).find(filter);
  }

  @post('/schedules/{id}/date-times', {
    responses: {
      '200': {
        description: 'Schedule model instance',
        content: {'application/json': {schema: getModelSchemaRef(DateTime)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Schedule.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          exclude: ["id", "updated_at", "created_at"],
          schema: getModelSchemaRef(DateTime, {
            title: 'NewDateTimeInSchedule',
            exclude: ["id", "updated_at", "created_at"],
            optional: ['scheduleId']
          }),
        },
      },
    }) dateTime: Omit<DateTime, 'id'>,
  ): Promise<DateTime> {
    return this.scheduleRepository.dateTimes(id).create(dateTime);
  }

  @patch('/schedules/{id}/date-times', {
    responses: {
      '200': {
        description: 'Schedule.DateTime PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          exclude: ["id", "updated_at", "created_at"],
          schema: getModelSchemaRef(DateTime, {partial: true}),
        },
      },
    })
    dateTime: Partial<DateTime>,
    @param.query.object('where', getWhereSchemaFor(DateTime)) where?: Where<DateTime>,
  ): Promise<Count> {
    return this.scheduleRepository.dateTimes(id).patch(dateTime, where);
  }

  @del('/schedules/{id}/date-times', {
    responses: {
      '200': {
        description: 'Schedule.DateTime DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(DateTime)) where?: Where<DateTime>,
  ): Promise<Count> {
    return this.scheduleRepository.dateTimes(id).delete(where);
  }
}
