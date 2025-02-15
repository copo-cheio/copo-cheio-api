import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  CheckInV2,
  Event,
} from '../models';
import {CheckInV2Repository} from '../repositories';

export class CheckInV2EventController {
  constructor(
    @repository(CheckInV2Repository)
    public checkInV2Repository: CheckInV2Repository,
  ) { }

  @get('/check-in-v2s/{id}/event', {
    responses: {
      '200': {
        description: 'Event belonging to CheckInV2',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Event),
          },
        },
      },
    },
  })
  async getEvent(
    @param.path.string('id') id: typeof CheckInV2.prototype.id,
  ): Promise<Event> {
    return this.checkInV2Repository.event(id);
  }
}
