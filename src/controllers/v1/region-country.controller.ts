import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Country, Region} from '../../models/v1';
import {RegionRepository} from '../../repositories/v1';

export class RegionCountryController {
  constructor(
    @repository(RegionRepository)
    public regionRepository: RegionRepository,
  ) {}

  @get('/regions/{id}/country', {
    responses: {
      '200': {
        description: 'Country belonging to Region',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Country),
          },
        },
      },
    },
  })
  async getCountry(
    @param.path.string('id') id: typeof Region.prototype.id,
  ): Promise<Country> {
    return this.regionRepository.country(id);
  }
}
