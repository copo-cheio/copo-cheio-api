import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Activity, User} from '../../models/v1';
import {ActivityRepository} from '../../repositories/v1';

export class ActivityUserController {
  constructor(
    @repository(ActivityRepository)
    public activityRepository: ActivityRepository,
  ) {}

  @get('/activities/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to Activity',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User),
          },
        },
      },
    },
  })
  async getUser(
    @param.path.string('id') id: typeof Activity.prototype.id,
  ): Promise<User> {
    return this.activityRepository.user(id);
  }
}
