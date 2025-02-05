import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Event, Lineup} from '../../models/v1';
import {LineupRepository} from '../../repositories/v1';

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
