import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Address, Region} from '../../models';
import {AddressRepository} from '../../repositories';

export class AddressRegionController {
  constructor(
    @repository(AddressRepository)
    public addressRepository: AddressRepository,
  ) {}

  @get('/addresses/{id}/region', {
    responses: {
      '200': {
        description: 'Region belonging to Address',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Region),
          },
        },
      },
    },
  })
  async getRegion(
    @param.path.string('id') id: typeof Address.prototype.id,
  ): Promise<Region> {
    return this.addressRepository.region(id);
  }
}
