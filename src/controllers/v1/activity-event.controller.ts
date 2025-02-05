import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Activity, Event} from '../../models/v1';
import {ActivityRepository} from '../../repositories/v1';

export class ActivityEventController {
  constructor(
    @repository(ActivityRepository)
    public activityRepository: ActivityRepository,
  ) {}

  @get('/activities/{id}/event', {
    responses: {
      '200': {
        description: 'Event belonging to Activity',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Event),
          },
        },
      },
    },
  })
  async getEvent(
    @param.path.string('id') id: typeof Activity.prototype.id,
  ): Promise<Event> {
    return this.activityRepository.event(id);
  }
}
