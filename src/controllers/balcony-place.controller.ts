import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Balcony,
  Place,
} from '../models';
import {BalconyRepository} from '../repositories';

export class BalconyPlaceController {
  constructor(
    @repository(BalconyRepository)
    public balconyRepository: BalconyRepository,
  ) { }

  @get('/balconies/{id}/place', {
    responses: {
      '200': {
        description: 'Place belonging to Balcony',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Place),
          },
        },
      },
    },
  })
  async getPlace(
    @param.path.string('id') id: typeof Balcony.prototype.id,
  ): Promise<Place> {
    return this.balconyRepository.place(id);
  }
}
