import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {PlaceInstance, Team} from '../models';
import {PlaceInstanceRepository} from '../repositories/v1/place-instance.repository';

export class PlaceInstanceTeamController {
  constructor(
    @repository(PlaceInstanceRepository)
    public placeInstanceRepository: PlaceInstanceRepository,
  ) {}

  @get('/place-instances/{id}/team', {
    responses: {
      '200': {
        description: 'Team belonging to PlaceInstance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Team),
          },
        },
      },
    },
  })
  async getTeam(
    @param.path.string('id') id: typeof PlaceInstance.prototype.id,
  ): Promise<Team> {
    return this.placeInstanceRepository.team(id);
  }
}
