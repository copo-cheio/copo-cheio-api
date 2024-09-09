import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  EventInstance,
  Event,
} from '../models';
import {EventInstanceRepository} from '../repositories';

export class EventInstanceEventController {
  constructor(
    @repository(EventInstanceRepository)
    public eventInstanceRepository: EventInstanceRepository,
  ) { }

  @get('/event-instances/{id}/event', {
    responses: {
      '200': {
        description: 'Event belonging to EventInstance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Event),
          },
        },
      },
    },
  })
  async getEvent(
    @param.path.string('id') id: typeof EventInstance.prototype.id,
  ): Promise<Event> {
    return this.eventInstanceRepository.event(id);
  }
}
