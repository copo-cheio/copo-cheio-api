import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Event, Lineup} from '../../models';
import {LineupRepository} from '../../repositories';

export class LineupEventController {
  constructor(
    @repository(LineupRepository)
    public lineupRepository: LineupRepository,
  ) {}

  @get('/lineups/{id}/event', {
    responses: {
      '200': {
        description: 'Event belonging to Lineup',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Event),
          },
        },
      },
    },
  })
  async getEvent(
    @param.path.string('id') id: typeof Lineup.prototype.id,
  ): Promise<Event> {
    return this.lineupRepository.event(id);
  }
}
