import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Search,
  User,
} from '../models';
import {SearchRepository} from '../repositories';

export class SearchUserController {
  constructor(
    @repository(SearchRepository)
    public searchRepository: SearchRepository,
  ) { }

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
