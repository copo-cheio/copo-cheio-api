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
  Place,
  EventInstance,
} from '../models';
import {PlaceRepository} from '../repositories';

export class PlaceEventInstanceController {
  constructor(
    @repository(PlaceRepository) protected placeRepository: PlaceRepository,
  ) { }

  @get('/places/{id}/event-instances', {
    responses: {
      '200': {
        description: 'Array of Place has many EventInstance',
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
    return this.placeRepository.eventInstances(id).find(filter);
  }

  @post('/places/{id}/event-instances', {
    responses: {
      '200': {
        description: 'Place model instance',
        content: {'application/json': {schema: getModelSchemaRef(EventInstance)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Place.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EventInstance, {
            title: 'NewEventInstanceInPlace',
            exclude: ['id'],
            optional: ['placeId']
          }),
        },
      },
    }) eventInstance: Omit<EventInstance, 'id'>,
  ): Promise<EventInstance> {
    return this.placeRepository.eventInstances(id).create(eventInstance);
  }

  @patch('/places/{id}/event-instances', {
    responses: {
      '200': {
        description: 'Place.EventInstance PATCH success count',
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
    return this.placeRepository.eventInstances(id).patch(eventInstance, where);
  }

  @del('/places/{id}/event-instances', {
    responses: {
      '200': {
        description: 'Place.EventInstance DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(EventInstance)) where?: Where<EventInstance>,
  ): Promise<Count> {
    return this.placeRepository.eventInstances(id).delete(where);
  }
}
