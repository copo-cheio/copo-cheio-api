import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Favorite,
  Event,
} from '../models';
import {FavoriteRepository} from '../repositories';

export class FavoriteEventController {
  constructor(
    @repository(FavoriteRepository)
    public favoriteRepository: FavoriteRepository,
  ) { }

  @get('/favorites/{id}/event', {
    responses: {
      '200': {
        description: 'Event belonging to Favorite',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Event),
          },
        },
      },
    },
  })
  async getEvent(
    @param.path.string('id') id: typeof Favorite.prototype.id,
  ): Promise<Event> {
    return this.favoriteRepository.event(id);
  }
}
