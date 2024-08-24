import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  LineUpArtist,
  Lineup,
} from '../models';
import {LineUpArtistRepository} from '../repositories';

export class LineUpArtistLineupController {
  constructor(
    @repository(LineUpArtistRepository)
    public lineUpArtistRepository: LineUpArtistRepository,
  ) { }

  @get('/line-up-artists/{id}/lineup', {
    responses: {
      '200': {
        description: 'Lineup belonging to LineUpArtist',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Lineup),
          },
        },
      },
    },
  })
  async getLineup(
    @param.path.string('id') id: typeof LineUpArtist.prototype.id,
  ): Promise<Lineup> {
    return this.lineUpArtistRepository.lineup(id);
  }
}
