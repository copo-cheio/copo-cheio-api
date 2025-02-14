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
import {Schedule, ScheduleRange} from '../../models';
import {ScheduleRepository} from '../../repositories';

export class ScheduleScheduleRangeController {
  constructor(
    @repository(ScheduleRepository)
    protected scheduleRepository: ScheduleRepository,
  ) {}

  @get('/schedules/{id}/schedule-ranges', {
    responses: {
      '200': {
        description: 'Array of Schedule has many ScheduleRange',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(ScheduleRange)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<ScheduleRange>,
  ): Promise<ScheduleRange[]> {
    return this.scheduleRepository.scheduleRanges(id).find(filter);
  }

  @post('/schedules/{id}/schedule-ranges', {
    responses: {
      '200': {
        description: 'Schedule model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(ScheduleRange)},
        },
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Schedule.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ScheduleRange, {
            title: 'NewScheduleRangeInSchedule',
            exclude: ['id', 'updated_at', 'created_at'],
            optional: ['scheduleId'],
          }),
        },
      },
    })
    scheduleRange: Omit<ScheduleRange, 'id'>,
  ): Promise<ScheduleRange> {
    return this.scheduleRepository.scheduleRanges(id).create(scheduleRange);
  }

  @patch('/schedules/{id}/schedule-ranges', {
    responses: {
      '200': {
        description: 'Schedule.ScheduleRange PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ScheduleRange, {partial: true}),
        },
      },
    })
    scheduleRange: Partial<ScheduleRange>,
    @param.query.object('where', getWhereSchemaFor(ScheduleRange))
    where?: Where<ScheduleRange>,
  ): Promise<Count> {
    return this.scheduleRepository
      .scheduleRanges(id)
      .patch(scheduleRange, where);
  }

  @del('/schedules/{id}/schedule-ranges', {
    responses: {
      '200': {
        description: 'Schedule.ScheduleRange DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(ScheduleRange))
    where?: Where<ScheduleRange>,
  ): Promise<Count> {
    return this.scheduleRepository.scheduleRanges(id).delete(where);
  }
}
