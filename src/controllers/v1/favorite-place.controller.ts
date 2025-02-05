import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Favorite, Place} from '../../models/v1';
import {FavoriteRepository} from '../../repositories/v1';

export class FavoritePlaceController {
  constructor(
    @repository(FavoriteRepository)
    public favoriteRepository: FavoriteRepository,
  ) {}

  @get('/favorites/{id}/place', {
    responses: {
      '200': {
        description: 'Place belonging to Favorite',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Place),
          },
        },
      },
    },
  })
  async getPlace(
    @param.path.string('id') id: typeof Favorite.prototype.id,
  ): Promise<Place> {
    return this.favoriteRepository.place(id);
  }
}
