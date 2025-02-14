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
import {Company, Event} from '../../models';
import {CompanyRepository} from '../../repositories';

export class CompanyEventController {
  constructor(
    @repository(CompanyRepository)
    protected companyRepository: CompanyRepository,
  ) {}

  @get('/companies/{id}/events', {
    responses: {
      '200': {
        description: 'Array of Company has many Event',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Event)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Event>,
  ): Promise<Event[]> {
    return this.companyRepository.events(id).find(filter);
  }

  @post('/companies/{id}/events', {
    responses: {
      '200': {
        description: 'Company model instance',
        content: {'application/json': {schema: getModelSchemaRef(Event)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Company.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Event, {
            title: 'NewEventInCompany',
            exclude: ['id'],
            optional: ['companyId'],
          }),
        },
      },
    })
    event: Omit<Event, 'id'>,
  ): Promise<Event> {
    return this.companyRepository.events(id).create(event);
  }

  @patch('/companies/{id}/events', {
    responses: {
      '200': {
        description: 'Company.Event PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Event, {partial: true}),
        },
      },
    })
    event: Partial<Event>,
    @param.query.object('where', getWhereSchemaFor(Event)) where?: Where<Event>,
  ): Promise<Count> {
    return this.companyRepository.events(id).patch(event, where);
  }

  @del('/companies/{id}/events', {
    responses: {
      '200': {
        description: 'Company.Event DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Event)) where?: Where<Event>,
  ): Promise<Count> {
    return this.companyRepository.events(id).delete(where);
  }
}
