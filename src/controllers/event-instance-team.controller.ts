import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  EventInstance,
  Team,
} from '../models';
import {EventInstanceRepository} from '../repositories';

export class EventInstanceTeamController {
  constructor(
    @repository(EventInstanceRepository)
    public eventInstanceRepository: EventInstanceRepository,
  ) { }

  @get('/event-instances/{id}/team', {
    responses: {
      '200': {
        description: 'Team belonging to EventInstance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Team),
          },
        },
      },
    },
  })
  async getTeam(
    @param.path.string('id') id: typeof EventInstance.prototype.id,
  ): Promise<Team> {
    return this.eventInstanceRepository.team(id);
  }
}
