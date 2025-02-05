import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Event, Favorite} from '../../models/v1';
import {FavoriteRepository} from '../../repositories/v1';

export class FavoriteEventController {
  constructor(
    @repository(FavoriteRepository)
    public favoriteRepository: FavoriteRepository,
  ) {}

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
