import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Event, Place} from '../../models/v1';
import {EventRepository} from '../../repositories/v1';

export class EventPlaceController {
  constructor(
    @repository(EventRepository)
    public eventRepository: EventRepository,
  ) {}

  @get('/events/{id}/place', {
    responses: {
      '200': {
        description: 'Place belonging to Event',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Place),
          },
        },
      },
    },
  })
  async getPlace(
    @param.path.string('id') id: typeof Event.prototype.id,
  ): Promise<Place> {
    return this.eventRepository.place(id);
  }
}
