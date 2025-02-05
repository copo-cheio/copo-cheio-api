import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Search, User} from '../../models/v1';
import {SearchRepository} from '../../repositories/v1';

export class SearchUserController {
  constructor(
    @repository(SearchRepository)
    public searchRepository: SearchRepository,
  ) {}

  @get('/searches/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to Search',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User),
          },
        },
      },
    },
  })
  async getUser(
    @param.path.string('id') id: typeof Search.prototype.id,
  ): Promise<User> {
    return this.searchRepository.user(id);
  }
}
