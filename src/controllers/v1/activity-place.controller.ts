import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Activity, Place} from '../../models/v1';
import {ActivityRepository} from '../../repositories/v1';

export class ActivityPlaceController {
  constructor(
    @repository(ActivityRepository)
    public activityRepository: ActivityRepository,
  ) {}

  @get('/activities/{id}/place', {
    responses: {
      '200': {
        description: 'Place belonging to Activity',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Place),
          },
        },
      },
    },
  })
  async getPlace(
    @param.path.string('id') id: typeof Activity.prototype.id,
  ): Promise<Place> {
    return this.activityRepository.place(id);
  }
}
