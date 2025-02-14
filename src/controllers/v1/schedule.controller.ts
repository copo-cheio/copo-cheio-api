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
import {
  IncludeScheduleRangeRelation,
  ScheduleTypes,
} from '../../blueprints/shared/schedule.include';
import {Schedule} from '../../models';
import {EventRepository, ScheduleRepository} from '../../repositories';

export class ScheduleController {
  constructor(
    @repository(ScheduleRepository)
    public scheduleRepository: ScheduleRepository,
    @repository(EventRepository)
    public eventRepository: EventRepository,
  ) {}

  @post('/schedules')
  @response(200, {
    description: 'Schedule model instance',
    content: {'application/json': {schema: getModelSchemaRef(Schedule)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          exclude: ['id', 'updated_at', 'created_at'],
          schema: getModelSchemaRef(Schedule, {
            title: 'NewSchedule',
            exclude: ['updated_at', 'created_at'],
          }),
        },
      },
    })
    schedule: Omit<Schedule, 'id'>,
  ): Promise<Schedule> {
    const result = await this.scheduleRepository.create(schedule);
    const id = result.id;
    delete result.id;

    const entity = await this.scheduleRepository.findById(id, {
      include: [IncludeScheduleRangeRelation],
    });
    await this.updateEventScheduleData(entity);
    return result;
  }

  @get('/schedules/count')
  @response(200, {
    description: 'Schedule model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Schedule) where?: Where<Schedule>): Promise<Count> {
    return this.scheduleRepository.count(where);
  }

  @get('/schedules')
  @response(200, {
    description: 'Array of Schedule model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Schedule, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Schedule) filter?: Filter<Schedule>,
  ): Promise<Schedule[]> {
    return this.scheduleRepository.find(filter);
  }

  @patch('/schedules')
  @response(200, {
    description: 'Schedule PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          exclude: ['id', 'updated_at', 'created_at'],
          schema: getModelSchemaRef(Schedule, {partial: true}),
        },
      },
    })
    schedule: Schedule,
    @param.where(Schedule) where?: Where<Schedule>,
  ): Promise<Count> {
    return this.scheduleRepository.updateAll(schedule, where);
  }

  @get('/schedules/{id}')
  @response(200, {
    description: 'Schedule model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Schedule, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Schedule, {exclude: 'where'})
    filter?: FilterExcludingWhere<Schedule>,
  ): Promise<Schedule> {
    return this.scheduleRepository.findById(id, filter);
  }

  @patch('/schedules/{id}')
  @response(204, {
    description: 'Schedule PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          exclude: ['updated_at', 'created_at'],
          schema: getModelSchemaRef(Schedule, {partial: true}),
        },
      },
    })
    schedule: Schedule,
  ): Promise<void> {
    const result = await this.scheduleRepository.updateById(id, schedule);
    const entity = await this.scheduleRepository.findById(id, {
      include: [IncludeScheduleRangeRelation],
    });
    await this.updateEventScheduleData(entity);
    return result;
  }

  @put('/schedules/{id}')
  @response(204, {
    description: 'Schedule PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() schedule: Schedule,
  ): Promise<void> {
    const result = await this.scheduleRepository.replaceById(id, schedule);
    const entity = await this.scheduleRepository.findById(id, {
      include: [IncludeScheduleRangeRelation],
    });
    await this.updateEventScheduleData(entity);
    return result;
  }

  @del('/schedules/{id}')
  @response(204, {
    description: 'Schedule DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.scheduleRepository.deleteById(id);
  }

  private async updateEventScheduleData(entity: any) {
    if (entity?.id) {
      const event = await this.eventRepository.findOne({
        where: {
          scheduleId: entity.id,
        },
      });
      if (!event) return;
      event.type = entity.type;
      if (entity.type == ScheduleTypes[0]) {
        const ends: any[] = [new Date('1900-01-01')];
        if (Array.isArray(entity?.scheduleRanges)) {
          entity.scheduleRanges.forEach((sr: any) => {
            if (sr?.end?.datetime) {
              ends.push(new Date(sr.end.datetime));
            }
          });
        }
        ends.sort((a, b) => b - a);

        event.endDate = ends[0];
      } else {
        event.endDate = new Date('3145-01-01');
      }
      await this.eventRepository.updateById(event.id, event);
    }
  }
}
