import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Artist,
  Playlist,
} from '../models';
import {ArtistRepository} from '../repositories';

export class ArtistPlaylistController {
  constructor(
    @repository(ArtistRepository)
    public artistRepository: ArtistRepository,
  ) { }

  @get('/artists/{id}/playlist', {
    responses: {
      '200': {
        description: 'Playlist belonging to Artist',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Playlist),
          },
        },
      },
    },
  })
  async getPlaylist(
    @param.path.string('id') id: typeof Artist.prototype.id,
  ): Promise<Playlist> {
    return this.artistRepository.playlist(id);
  }
}
