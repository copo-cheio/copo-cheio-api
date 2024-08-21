import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Region,
  Country,
} from '../models';
import {RegionRepository} from '../repositories';

export class RegionCountryController {
  constructor(
    @repository(RegionRepository)
    public regionRepository: RegionRepository,
  ) { }

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