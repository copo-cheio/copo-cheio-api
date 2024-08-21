import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Place,
  Playlist,
} from '../models';
import {PlaceRepository} from '../repositories';

export class PlacePlaylistController {
  constructor(
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,
  ) { }

  @get('/places/{id}/playlist', {
    responses: {
      '200': {
        description: 'Playlist belonging to Place',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Playlist),
          },
        },
      },
    },
  })
  async getPlaylist(
    @param.path.string('id') id: typeof Place.prototype.id,
  ): Promise<Playlist> {
    return this.placeRepository.playlist(id);
  }
}
