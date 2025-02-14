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
import {Event, Team} from '../../models';
import {TeamRepository} from '../../repositories';

export class TeamEventController {
  constructor(
    @repository(TeamRepository) protected teamRepository: TeamRepository,
  ) {}

  @get('/teams/{id}/events', {
    responses: {
      '200': {
        description: 'Array of Team has many Event',
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
    return this.teamRepository.events(id).find(filter);
  }

  @post('/teams/{id}/events', {
    responses: {
      '200': {
        description: 'Team model instance',
        content: {'application/json': {schema: getModelSchemaRef(Event)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Team.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Event, {
            title: 'NewEventInTeam',
            exclude: ['id'],
            optional: ['teamId'],
          }),
        },
      },
    })
    event: Omit<Event, 'id'>,
  ): Promise<Event> {
    return this.teamRepository.events(id).create(event);
  }

  @patch('/teams/{id}/events', {
    responses: {
      '200': {
        description: 'Team.Event PATCH success count',
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
    return this.teamRepository.events(id).patch(event, where);
  }

  @del('/teams/{id}/events', {
    responses: {
      '200': {
        description: 'Team.Event DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Event)) where?: Where<Event>,
  ): Promise<Count> {
    return this.teamRepository.events(id).delete(where);
  }
}
