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
  Playlist,
} from '../models';
import {EventRepository} from '../repositories';

export class EventPlaylistController {
  constructor(
    @repository(EventRepository)
    public eventRepository: EventRepository,
  ) { }

  @get('/events/{id}/playlist', {
    responses: {
      '200': {
        description: 'Playlist belonging to Event',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Playlist),
          },
        },
      },
    },
  })
  async getPlaylist(
    @param.path.string('id') id: typeof Event.prototype.id,
  ): Promise<Playlist> {
    return this.eventRepository.playlist(id);
  }
}
