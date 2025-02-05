import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Artist, Playlist} from '../../models/v1';
import {ArtistRepository} from '../../repositories/v1';

export class ArtistPlaylistController {
  constructor(
    @repository(ArtistRepository)
    public artistRepository: ArtistRepository,
  ) {}

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
