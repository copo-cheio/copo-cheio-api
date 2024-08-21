import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  DateTime,
  Schedule,
} from '../models';
import {DateTimeRepository} from '../repositories';

export class DateTimeScheduleController {
  constructor(
    @repository(DateTimeRepository)
    public dateTimeRepository: DateTimeRepository,
  ) { }

  @get('/date-times/{id}/schedule', {
    responses: {
      '200': {
        description: 'Schedule belonging to DateTime',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Schedule),
          },
        },
      },
    },
  })
  async getSchedule(
    @param.path.string('id') id: typeof DateTime.prototype.id,
  ): Promise<Schedule> {
    return this.dateTimeRepository.schedule(id);
  }
}
