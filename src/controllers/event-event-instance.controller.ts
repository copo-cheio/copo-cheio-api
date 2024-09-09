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
  Event,
  EventInstance,
} from '../models';
import {EventRepository} from '../repositories';

export class EventEventInstanceController {
  constructor(
    @repository(EventRepository) protected eventRepository: EventRepository,
  ) { }

  @get('/events/{id}/event-instances', {
    responses: {
      '200': {
        description: 'Array of Event has many EventInstance',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(EventInstance)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<EventInstance>,
  ): Promise<EventInstance[]> {
    return this.eventRepository.instances(id).find(filter);
  }

  @post('/events/{id}/event-instances', {
    responses: {
      '200': {
        description: 'Event model instance',
        content: {'application/json': {schema: getModelSchemaRef(EventInstance)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Event.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EventInstance, {
            title: 'NewEventInstanceInEvent',
            exclude: ['id'],
            optional: ['eventId']
          }),
        },
      },
    }) eventInstance: Omit<EventInstance, 'id'>,
  ): Promise<EventInstance> {
    return this.eventRepository.instances(id).create(eventInstance);
  }

  @patch('/events/{id}/event-instances', {
    responses: {
      '200': {
        description: 'Event.EventInstance PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EventInstance, {partial: true}),
        },
      },
    })
    eventInstance: Partial<EventInstance>,
    @param.query.object('where', getWhereSchemaFor(EventInstance)) where?: Where<EventInstance>,
  ): Promise<Count> {
    return this.eventRepository.instances(id).patch(eventInstance, where);
  }

  @del('/events/{id}/event-instances', {
    responses: {
      '200': {
        description: 'Event.EventInstance DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(EventInstance)) where?: Where<EventInstance>,
  ): Promise<Count> {
    return this.eventRepository.instances(id).delete(where);
  }
}
