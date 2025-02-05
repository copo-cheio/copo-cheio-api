import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Schedule, ScheduleRange} from '../../models/v1';
import {ScheduleRangeRepository} from '../../repositories/v1';

export class ScheduleRangeScheduleController {
  constructor(
    @repository(ScheduleRangeRepository)
    public scheduleRangeRepository: ScheduleRangeRepository,
  ) {}

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
