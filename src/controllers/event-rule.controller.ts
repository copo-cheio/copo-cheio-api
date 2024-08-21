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
EventRule,
Rule,
} from '../models';
import {EventRepository} from '../repositories';

export class EventRuleController {
  constructor(
    @repository(EventRepository) protected eventRepository: EventRepository,
  ) { }

  @get('/events/{id}/rules', {
    responses: {
      '200': {
        description: 'Array of Event has many Rule through EventRule',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Rule)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Rule>,
  ): Promise<Rule[]> {
    return this.eventRepository.rules(id).find(filter);
  }

  @post('/events/{id}/rules', {
    responses: {
      '200': {
        description: 'create a Rule model instance',
        content: {'application/json': {schema: getModelSchemaRef(Rule)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Event.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Rule, {
            title: 'NewRuleInEvent',
            exclude: ['id'],
          }),
        },
      },
    }) rule: Omit<Rule, 'id'>,
  ): Promise<Rule> {
    return this.eventRepository.rules(id).create(rule);
  }

  @patch('/events/{id}/rules', {
    responses: {
      '200': {
        description: 'Event.Rule PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Rule, {partial: true}),
        },
      },
    })
    rule: Partial<Rule>,
    @param.query.object('where', getWhereSchemaFor(Rule)) where?: Where<Rule>,
  ): Promise<Count> {
    return this.eventRepository.rules(id).patch(rule, where);
  }

  @del('/events/{id}/rules', {
    responses: {
      '200': {
        description: 'Event.Rule DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Rule)) where?: Where<Rule>,
  ): Promise<Count> {
    return this.eventRepository.rules(id).delete(where);
  }
}
