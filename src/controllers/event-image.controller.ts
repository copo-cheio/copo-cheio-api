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
  Image,
} from '../models';
import {EventRepository} from '../repositories';

export class EventImageController {
  constructor(
    @repository(EventRepository)
    public eventRepository: EventRepository,
  ) { }

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
