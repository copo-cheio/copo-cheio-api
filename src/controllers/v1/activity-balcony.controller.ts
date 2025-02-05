import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Activity, Balcony} from '../../models/v1';
import {ActivityRepository} from '../../repositories/v1';

export class ActivityBalconyController {
  constructor(
    @repository(ActivityRepository)
    public activityRepository: ActivityRepository,
  ) {}

  @get('/activities/{id}/balcony', {
    responses: {
      '200': {
        description: 'Balcony belonging to Activity',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Balcony),
          },
        },
      },
    },
  })
  async getBalcony(
    @param.path.string('id') id: typeof Activity.prototype.id,
  ): Promise<Balcony> {
    return this.activityRepository.balcony(id);
  }
}
