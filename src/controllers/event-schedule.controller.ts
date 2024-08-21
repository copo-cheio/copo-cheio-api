import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Event,
  Schedule,
} from '../models';
import {EventRepository} from '../repositories';

export class EventScheduleController {
  constructor(
    @repository(EventRepository)
    public eventRepository: EventRepository,
  ) { }

  @get('/events/{id}/schedule', {
    responses: {
      '200': {
        description: 'Schedule belonging to Event',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Schedule),
          },
        },
      },
    },
  })
  async getSchedule(
    @param.path.string('id') id: typeof Event.prototype.id,
  ): Promise<Schedule> {
    return this.eventRepository.schedule(id);
  }
}
