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
  Place,
} from '../models';
import {EventInstanceRepository} from '../repositories';

export class EventInstancePlaceController {
  constructor(
    @repository(EventInstanceRepository)
    public eventInstanceRepository: EventInstanceRepository,
  ) { }

  @get('/event-instances/{id}/place', {
    responses: {
      '200': {
        description: 'Place belonging to EventInstance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Place),
          },
        },
      },
    },
  })
  async getPlace(
    @param.path.string('id') id: typeof EventInstance.prototype.id,
  ): Promise<Place> {
    return this.eventInstanceRepository.place(id);
  }
}
