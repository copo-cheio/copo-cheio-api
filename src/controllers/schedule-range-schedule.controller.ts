import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  ScheduleRange,
  Schedule,
} from '../models';
import {ScheduleRangeRepository} from '../repositories';

export class ScheduleRangeScheduleController {
  constructor(
    @repository(ScheduleRangeRepository)
    public scheduleRangeRepository: ScheduleRangeRepository,
  ) { }

  @get('/schedule-ranges/{id}/schedule', {
    responses: {
      '200': {
        description: 'Schedule belonging to ScheduleRange',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Schedule),
          },
        },
      },
    },
  })
  async getSchedule(
    @param.path.string('id') id: typeof ScheduleRange.prototype.id,
  ): Promise<Schedule> {
    return this.scheduleRangeRepository.schedule(id);
  }
}
