import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Favorite, User} from '../../models';
import {FavoriteRepository} from '../../repositories';

export class FavoriteUserController {
  constructor(
    @repository(FavoriteRepository)
    public favoriteRepository: FavoriteRepository,
  ) {}

  @get('/favorites/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to Favorite',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User),
          },
        },
      },
    },
  })
  async getUser(
    @param.path.string('id') id: typeof Favorite.prototype.id,
  ): Promise<User> {
    return this.favoriteRepository.user(id);
  }
}
