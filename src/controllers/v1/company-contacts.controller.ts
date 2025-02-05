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
import {Company, Contacts} from '../../models/v1';
import {CompanyRepository} from '../../repositories/v1';

export class CompanyContactsController {
  constructor(
    @repository(CompanyRepository)
    protected companyRepository: CompanyRepository,
  ) {}

  @get('/companies/{id}/contacts', {
    responses: {
      '200': {
        description: 'Company has one Contacts',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Contacts),
          },
        },
      },
    },
  })
  async get(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Contacts>,
  ): Promise<Contacts> {
    return this.companyRepository.contacts(id).get(filter);
  }

  @post('/companies/{id}/contacts', {
    responses: {
      '200': {
        description: 'Company model instance',
        content: {'application/json': {schema: getModelSchemaRef(Contacts)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Company.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Contacts, {
            title: 'NewContactsInCompany',
            exclude: ['id'],
            optional: ['refId'],
          }),
        },
      },
    })
    contacts: Omit<Contacts, 'id'>,
  ): Promise<Contacts> {
    return this.companyRepository.contacts(id).create(contacts);
  }

  @patch('/companies/{id}/contacts', {
    responses: {
      '200': {
        description: 'Company.Contacts PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Contacts, {partial: true}),
        },
      },
    })
    contacts: Partial<Contacts>,
    @param.query.object('where', getWhereSchemaFor(Contacts))
    where?: Where<Contacts>,
  ): Promise<Count> {
    return this.companyRepository.contacts(id).patch(contacts, where);
  }

  @del('/companies/{id}/contacts', {
    responses: {
      '200': {
        description: 'Company.Contacts DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Contacts))
    where?: Where<Contacts>,
  ): Promise<Count> {
    return this.companyRepository.contacts(id).delete(where);
  }
}
