import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Song,
  Artist,
} from '../models';
import {SongRepository} from '../repositories';

export class SongArtistController {
  constructor(
    @repository(SongRepository)
    public songRepository: SongRepository,
  ) { }

  @get('/songs/{id}/artist', {
    responses: {
      '200': {
        description: 'Artist belonging to Song',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Artist),
          },
        },
      },
    },
  })
  async getArtist(
    @param.path.string('id') id: typeof Song.prototype.id,
  ): Promise<Artist> {
    return this.songRepository.artist(id);
  }
}
