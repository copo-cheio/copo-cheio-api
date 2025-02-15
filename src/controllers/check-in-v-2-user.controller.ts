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
  User,
} from '../models';
import {CheckInV2Repository} from '../repositories';

export class CheckInV2UserController {
  constructor(
    @repository(CheckInV2Repository)
    public checkInV2Repository: CheckInV2Repository,
  ) { }

  @get('/check-in-v2s/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to CheckInV2',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User),
          },
        },
      },
    },
  })
  async getUser(
    @param.path.string('id') id: typeof CheckInV2.prototype.id,
  ): Promise<User> {
    return this.checkInV2Repository.user(id);
  }
}
