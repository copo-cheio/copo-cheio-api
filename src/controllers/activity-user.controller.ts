import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Activity,
  User,
} from '../models';
import {ActivityRepository} from '../repositories';

export class ActivityUserController {
  constructor(
    @repository(ActivityRepository)
    public activityRepository: ActivityRepository,
  ) { }

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
