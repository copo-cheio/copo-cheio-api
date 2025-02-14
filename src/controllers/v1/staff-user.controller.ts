import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Staff, User} from '../../models';
import {StaffRepository} from '../../repositories';

export class StaffUserController {
  constructor(
    @repository(StaffRepository)
    public staffRepository: StaffRepository,
  ) {}

  @get('/staff/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to Staff',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User),
          },
        },
      },
    },
  })
  async getUser(
    @param.path.string('id') id: typeof Staff.prototype.id,
  ): Promise<User> {
    return this.staffRepository.user(id);
  }
}
