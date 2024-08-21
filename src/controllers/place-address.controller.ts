import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Place,
  Address,
} from '../models';
import {PlaceRepository} from '../repositories';

export class PlaceAddressController {
  constructor(
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,
  ) { }

  @get('/places/{id}/address', {
    responses: {
      '200': {
        description: 'Address belonging to Place',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Address),
          },
        },
      },
    },
  })
  async getAddress(
    @param.path.string('id') id: typeof Place.prototype.id,
  ): Promise<Address> {
    return this.placeRepository.address(id);
  }
}
