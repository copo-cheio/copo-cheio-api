import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Team,
  Image,
} from '../models';
import {TeamRepository} from '../repositories';

export class TeamImageController {
  constructor(
    @repository(TeamRepository)
    public teamRepository: TeamRepository,
  ) { }

  @get('/teams/{id}/image', {
    responses: {
      '200': {
        description: 'Image belonging to Team',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Image),
          },
        },
      },
    },
  })
  async getImage(
    @param.path.string('id') id: typeof Team.prototype.coverId,
  ): Promise<Image> {
    return this.teamRepository.cover(id);
  }
}
