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
import {
  Company,
  Staff,
} from '../models';
import {CompanyRepository} from '../repositories';

export class CompanyStaffController {
  constructor(
    @repository(CompanyRepository) protected companyRepository: CompanyRepository,
  ) { }

  @get('/companies/{id}/staff', {
    responses: {
      '200': {
        description: 'Array of Company has many Staff',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Staff)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Staff>,
  ): Promise<Staff[]> {
    return this.companyRepository.staffMembers(id).find(filter);
  }

  @post('/companies/{id}/staff', {
    responses: {
      '200': {
        description: 'Company model instance',
        content: {'application/json': {schema: getModelSchemaRef(Staff)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Company.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Staff, {
            title: 'NewStaffInCompany',
            exclude: ['id'],
            optional: ['companyId']
          }),
        },
      },
    }) staff: Omit<Staff, 'id'>,
  ): Promise<Staff> {
    return this.companyRepository.staffMembers(id).create(staff);
  }

  @patch('/companies/{id}/staff', {
    responses: {
      '200': {
        description: 'Company.Staff PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Staff, {partial: true}),
        },
      },
    })
    staff: Partial<Staff>,
    @param.query.object('where', getWhereSchemaFor(Staff)) where?: Where<Staff>,
  ): Promise<Count> {
    return this.companyRepository.staffMembers(id).patch(staff, where);
  }

  @del('/companies/{id}/staff', {
    responses: {
      '200': {
        description: 'Company.Staff DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Staff)) where?: Where<Staff>,
  ): Promise<Count> {
    return this.companyRepository.staffMembers(id).delete(where);
  }
}
