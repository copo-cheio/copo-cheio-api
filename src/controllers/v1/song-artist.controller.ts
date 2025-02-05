import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Artist, Song} from '../../models/v1';
import {SongRepository} from '../../repositories/v1';

export class SongArtistController {
  constructor(
    @repository(SongRepository)
    public songRepository: SongRepository,
  ) {}

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
