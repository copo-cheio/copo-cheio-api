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
  Team,
} from '../models';
import {PlaceRepository} from '../repositories';

export class PlaceTeamController {
  constructor(
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,
  ) { }

  @get('/places/{id}/team', {
    responses: {
      '200': {
        description: 'Team belonging to Place',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Team),
          },
        },
      },
    },
  })
  async getTeam(
    @param.path.string('id') id: typeof Place.prototype.id,
  ): Promise<Team> {
    return this.placeRepository.team(id);
  }
}
