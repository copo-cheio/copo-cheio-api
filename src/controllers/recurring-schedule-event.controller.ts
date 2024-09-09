import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  RecurringSchedule,
  Event,
} from '../models';
import {RecurringScheduleRepository} from '../repositories';

export class RecurringScheduleEventController {
  constructor(
    @repository(RecurringScheduleRepository)
    public recurringScheduleRepository: RecurringScheduleRepository,
  ) { }

  @get('/recurring-schedules/{id}/event', {
    responses: {
      '200': {
        description: 'Event belonging to RecurringSchedule',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Event),
          },
        },
      },
    },
  })
  async getEvent(
    @param.path.string('id') id: typeof RecurringSchedule.prototype.id,
  ): Promise<Event> {
    return this.recurringScheduleRepository.event(id);
  }
}
