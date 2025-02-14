import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {Country, Region} from '../../models';
import {CountryRepository} from '../../repositories';

export class CountryRegionController {
  constructor(
    @repository(CountryRepository)
    protected countryRepository: CountryRepository,
  ) {}

  @get('/countries/{id}/regions', {
    responses: {
      '200': {
        description: 'Array of Country has many Region',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Region)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Region>,
  ): Promise<Region[]> {
    return this.countryRepository.regions(id).find(filter);
  }

  @post('/countries/{id}/regions', {
    responses: {
      '200': {
        description: 'Country model instance',
        content: {'application/json': {schema: getModelSchemaRef(Region)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Country.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          exclude: ['id', 'updated_at', 'created_at'],
          schema: getModelSchemaRef(Region, {
            title: 'NewRegionInCountry',
            exclude: ['id', 'updated_at', 'created_at'],
            optional: ['countryId'],
          }),
        },
      },
    })
    region: Omit<Region, 'id'>,
  ): Promise<Region> {
    return this.countryRepository.regions(id).create(region);
  }

  @patch('/countries/{id}/regions', {
    responses: {
      '200': {
        description: 'Country.Region PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          exclude: ['id', 'updated_at', 'created_at'],
          schema: getModelSchemaRef(Region, {partial: true}),
        },
      },
    })
    region: Partial<Region>,
    @param.query.object('where', getWhereSchemaFor(Region))
    where?: Where<Region>,
  ): Promise<Count> {
    return this.countryRepository.regions(id).patch(region, where);
  }

  @del('/countries/{id}/regions', {
    responses: {
      '200': {
        description: 'Country.Region DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Region))
    where?: Where<Region>,
  ): Promise<Count> {
    return this.countryRepository.regions(id).delete(where);
  }
}
