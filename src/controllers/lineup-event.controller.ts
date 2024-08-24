import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Lineup,
  Event,
} from '../models';
import {LineupRepository} from '../repositories';

export class LineupEventController {
  constructor(
    @repository(LineupRepository)
    public lineupRepository: LineupRepository,
  ) { }

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
