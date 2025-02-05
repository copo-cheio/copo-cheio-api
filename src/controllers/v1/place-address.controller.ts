import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Address, Place} from '../../models/v1';
import {PlaceRepository} from '../../repositories/v1';

export class PlaceAddressController {
  constructor(
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,
  ) {}

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
