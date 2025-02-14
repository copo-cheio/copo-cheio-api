import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Artist, LineUpArtist} from '../../models';
import {LineUpArtistRepository} from '../../repositories';

export class LineUpArtistArtistController {
  constructor(
    @repository(LineUpArtistRepository)
    public lineUpArtistRepository: LineUpArtistRepository,
  ) {}

  @get('/line-up-artists/{id}/artist', {
    responses: {
      '200': {
        description: 'Artist belonging to LineUpArtist',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Artist),
          },
        },
      },
    },
  })
  async getArtist(
    @param.path.string('id') id: typeof LineUpArtist.prototype.id,
  ): Promise<Artist> {
    return this.lineUpArtistRepository.artist(id);
  }
}
