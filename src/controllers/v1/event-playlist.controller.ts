import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param, requestBody} from '@loopback/rest';
import {Event, Playlist} from '../../models';
import {EventRepository, PlaylistRepository} from '../../repositories';

export class EventPlaylistController {
  constructor(
    @repository(EventRepository)
    public eventRepository: EventRepository,
    @repository(PlaylistRepository)
    public playlistRepository: PlaylistRepository,
  ) {}

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

  async create(
    @param.path.string('id') id: typeof Event.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Playlist, {
            title: 'NewPlaylistInPlace',
            exclude: ['id'],
          }),
        },
      },
    })
    playlist: Omit<Playlist, 'id'>,
  ): Promise<Playlist> {
    // let playlist = await  this.placeRepository.playlist(id);
    const record = await this.playlistRepository.create(playlist);
    await this.eventRepository.updateById(id, {playlistId: record.id});

    return record;
  }
}
