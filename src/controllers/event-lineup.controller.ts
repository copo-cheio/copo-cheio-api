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
  Lineup,
} from '../models';
import {EventRepository} from '../repositories';

export class EventLineupController {
  constructor(
    @repository(EventRepository) protected eventRepository: EventRepository,
  ) { }

  @get('/events/{id}/lineups', {
    responses: {
      '200': {
        description: 'Array of Event has many Lineup',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Lineup)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Lineup>,
  ): Promise<Lineup[]> {
    return this.eventRepository.lineups(id).find(filter);
  }

  @post('/events/{id}/lineups', {
    responses: {
      '200': {
        description: 'Event model instance',
        content: {'application/json': {schema: getModelSchemaRef(Lineup)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Event.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Lineup, {
            title: 'NewLineupInEvent',
            exclude: ['id'],
            optional: ['eventId']
          }),
        },
      },
    }) lineup: Omit<Lineup, 'id'>,
  ): Promise<Lineup> {
    return this.eventRepository.lineups(id).create(lineup);
  }

  @patch('/events/{id}/lineups', {
    responses: {
      '200': {
        description: 'Event.Lineup PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Lineup, {partial: true}),
        },
      },
    })
    lineup: Partial<Lineup>,
    @param.query.object('where', getWhereSchemaFor(Lineup)) where?: Where<Lineup>,
  ): Promise<Count> {
    return this.eventRepository.lineups(id).patch(lineup, where);
  }

  @del('/events/{id}/lineups', {
    responses: {
      '200': {
        description: 'Event.Lineup DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Lineup)) where?: Where<Lineup>,
  ): Promise<Count> {
    return this.eventRepository.lineups(id).delete(where);
  }
}
