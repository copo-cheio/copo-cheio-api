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
import {Company, Place} from '../../models';
import {CompanyRepository} from '../../repositories';

export class CompanyPlaceController {
  constructor(
    @repository(CompanyRepository)
    protected companyRepository: CompanyRepository,
  ) {}

  @get('/companies/{id}/places', {
    responses: {
      '200': {
        description: 'Array of Company has many Place',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Place)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Place>,
  ): Promise<Place[]> {
    return this.companyRepository.places(id).find(filter);
  }

  @post('/companies/{id}/places', {
    responses: {
      '200': {
        description: 'Company model instance',
        content: {'application/json': {schema: getModelSchemaRef(Place)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Company.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Place, {
            title: 'NewPlaceInCompany',
            exclude: ['id'],
            optional: ['companyId'],
          }),
        },
      },
    })
    place: Omit<Place, 'id'>,
  ): Promise<Place> {
    return this.companyRepository.places(id).create(place);
  }

  @patch('/companies/{id}/places', {
    responses: {
      '200': {
        description: 'Company.Place PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Place, {partial: true}),
        },
      },
    })
    place: Partial<Place>,
    @param.query.object('where', getWhereSchemaFor(Place)) where?: Where<Place>,
  ): Promise<Count> {
    return this.companyRepository.places(id).patch(place, where);
  }

  @del('/companies/{id}/places', {
    responses: {
      '200': {
        description: 'Company.Place DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Place)) where?: Where<Place>,
  ): Promise<Count> {
    return this.companyRepository.places(id).delete(where);
  }
}
