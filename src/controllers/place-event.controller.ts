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
    Place,
} from '../models';
import { PlaceRepository } from '../repositories';

export class PlaceEventController {
  constructor(
    @repository(PlaceRepository) protected placeRepository: PlaceRepository,
  ) { }

  @get('/places/{id}/events', {
    responses: {
      '200': {
        description: 'Array of Place has many Event',
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
    return this.placeRepository.events(id).find(filter);
  }

  @post('/places/{id}/events', {
    responses: {
      '200': {
        description: 'Place model instance',
        content: {'application/json': {schema: getModelSchemaRef(Event)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Place.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          exclude: ["id", "updated_at", "created_at"],
          schema: getModelSchemaRef(Event, {
            title: 'NewEventInPlace',
            exclude: ["id", "updated_at", "created_at"],
            optional: ['placeId']
          }),
        },
      },
    }) event: Omit<Event, 'id'>,
  ): Promise<Event> {
    return this.placeRepository.events(id).create(event);
  }

  @patch('/places/{id}/events', {
    responses: {
      '200': {
        description: 'Place.Event PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          exclude: ["id", "updated_at", "created_at"],
          schema: getModelSchemaRef(Event, {partial: true}),
        },
      },
    })
    event: Partial<Event>,
    @param.query.object('where', getWhereSchemaFor(Event)) where?: Where<Event>,
  ): Promise<Count> {
    return this.placeRepository.events(id).patch(event, where);
  }

  @del('/places/{id}/events', {
    responses: {
      '200': {
        description: 'Place.Event DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Event)) where?: Where<Event>,
  ): Promise<Count> {
    return this.placeRepository.events(id).delete(where);
  }
}
