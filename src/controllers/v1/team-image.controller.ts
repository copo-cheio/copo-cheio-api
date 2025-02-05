import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Image, Team} from '../../models/v1';
import {TeamRepository} from '../../repositories/v1';

export class TeamImageController {
  constructor(
    @repository(TeamRepository)
    public teamRepository: TeamRepository,
  ) {}

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
