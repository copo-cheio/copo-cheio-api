import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {DateTime, ScheduleRange} from '../../models';
import {ScheduleRangeRepository} from '../../repositories';

export class ScheduleRangeDateTimeController {
  constructor(
    @repository(ScheduleRangeRepository)
    public scheduleRangeRepository: ScheduleRangeRepository,
  ) {}

  @get('/schedule-ranges/{id}/date-time', {
    responses: {
      '200': {
        description: 'DateTime belonging to ScheduleRange',
        content: {
          'application/json': {
            schema: getModelSchemaRef(DateTime),
          },
        },
      },
    },
  })
  async getDateTime(
    @param.path.string('id') id: typeof ScheduleRange.prototype.id,
  ): Promise<DateTime> {
    return this.scheduleRangeRepository.end(id);
  }
}
