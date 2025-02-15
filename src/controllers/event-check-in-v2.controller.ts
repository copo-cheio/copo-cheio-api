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
  CheckInV2,
} from '../models';
import {EventRepository} from '../repositories';

export class EventCheckInV2Controller {
  constructor(
    @repository(EventRepository) protected eventRepository: EventRepository,
  ) { }

  @get('/events/{id}/check-in-v2s', {
    responses: {
      '200': {
        description: 'Array of Event has many CheckInV2',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(CheckInV2)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<CheckInV2>,
  ): Promise<CheckInV2[]> {
    return this.eventRepository.checkInsV2(id).find(filter);
  }

  @post('/events/{id}/check-in-v2s', {
    responses: {
      '200': {
        description: 'Event model instance',
        content: {'application/json': {schema: getModelSchemaRef(CheckInV2)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Event.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CheckInV2, {
            title: 'NewCheckInV2InEvent',
            exclude: ['id'],
            optional: ['eventId']
          }),
        },
      },
    }) checkInV2: Omit<CheckInV2, 'id'>,
  ): Promise<CheckInV2> {
    return this.eventRepository.checkInsV2(id).create(checkInV2);
  }

  @patch('/events/{id}/check-in-v2s', {
    responses: {
      '200': {
        description: 'Event.CheckInV2 PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CheckInV2, {partial: true}),
        },
      },
    })
    checkInV2: Partial<CheckInV2>,
    @param.query.object('where', getWhereSchemaFor(CheckInV2)) where?: Where<CheckInV2>,
  ): Promise<Count> {
    return this.eventRepository.checkInsV2(id).patch(checkInV2, where);
  }

  @del('/events/{id}/check-in-v2s', {
    responses: {
      '200': {
        description: 'Event.CheckInV2 DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(CheckInV2)) where?: Where<CheckInV2>,
  ): Promise<Count> {
    return this.eventRepository.checkInsV2(id).delete(where);
  }
}
