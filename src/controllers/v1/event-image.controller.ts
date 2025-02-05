import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Event, Image} from '../../models/v1';
import {EventRepository} from '../../repositories/v1';

export class EventImageController {
  constructor(
    @repository(EventRepository)
    public eventRepository: EventRepository,
  ) {}

  @get('/events/{id}/image', {
    responses: {
      '200': {
        description: 'Image belonging to Event',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Image),
          },
        },
      },
    },
  })
  async getImage(
    @param.path.string('id') id: typeof Event.prototype.id,
  ): Promise<Image> {
    return this.eventRepository.cover(id);
  }
}
