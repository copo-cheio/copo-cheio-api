import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Address, Country} from '../../models/v1';
import {AddressRepository} from '../../repositories/v1';

export class AddressCountryController {
  constructor(
    @repository(AddressRepository)
    public addressRepository: AddressRepository,
  ) {}

  @get('/addresses/{id}/country', {
    responses: {
      '200': {
        description: 'Country belonging to Address',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Country),
          },
        },
      },
    },
  })
  async getCountry(
    @param.path.string('id') id: typeof Address.prototype.id,
  ): Promise<Country> {
    return this.addressRepository.country(id);
  }
}
