import {
  repository,
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
} from '@loopback/rest';
import {
  Event,
  EventInstance,
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
  @get('/event-instances', {
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
  async getEventInstances(

  ): Promise<EventInstance[]> {
    return this.eventInstanceRepository.findAll();
  }
}
