import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Event, Team} from '../../models';
import {EventRepository} from '../../repositories';

export class EventTeamController {
  constructor(
    @repository(EventRepository)
    public eventRepository: EventRepository,
  ) {}

  @get('/events/{id}/team', {
    responses: {
      '200': {
        description: 'Team belonging to Event',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Team),
          },
        },
      },
    },
  })
  async getTeam(
    @param.path.string('id') id: typeof Event.prototype.id,
  ): Promise<Team> {
    return this.eventRepository.team(id);
  }
}
