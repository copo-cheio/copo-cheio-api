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
import {Contacts, Event} from '../../models';
import {EventRepository} from '../../repositories';

export class EventContactsController {
  constructor(
    @repository(EventRepository) protected eventRepository: EventRepository,
  ) {}

  @get('/events/{id}/contacts', {
    responses: {
      '200': {
        description: 'Event has one Contacts',
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
    return this.eventRepository.contacts(id).get(filter);
  }

  @post('/events/{id}/contacts', {
    responses: {
      '200': {
        description: 'Event model instance',
        content: {'application/json': {schema: getModelSchemaRef(Contacts)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Event.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Contacts, {
            title: 'NewContactsInEvent',
            exclude: ['id'],
            optional: ['refId'],
          }),
        },
      },
    })
    contacts: Omit<Contacts, 'id'>,
  ): Promise<Contacts> {
    return this.eventRepository.contacts(id).create(contacts);
  }

  @patch('/events/{id}/contacts', {
    responses: {
      '200': {
        description: 'Event.Contacts PATCH success count',
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
    return this.eventRepository.contacts(id).patch(contacts, where);
  }

  @del('/events/{id}/contacts', {
    responses: {
      '200': {
        description: 'Event.Contacts DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Contacts))
    where?: Where<Contacts>,
  ): Promise<Count> {
    return this.eventRepository.contacts(id).delete(where);
  }
}
