import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Event, RecurringSchedule} from '../../models/v1';
import {RecurringScheduleRepository} from '../../repositories/v1';

export class RecurringScheduleEventController {
  constructor(
    @repository(RecurringScheduleRepository)
    public recurringScheduleRepository: RecurringScheduleRepository,
  ) {}

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
