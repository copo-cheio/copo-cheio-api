import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Address,
  Country,
} from '../models';
import {AddressRepository} from '../repositories';

export class AddressCountryController {
  constructor(
    @repository(AddressRepository)
    public addressRepository: AddressRepository,
  ) { }

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
