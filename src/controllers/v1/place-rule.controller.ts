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
import {Place, Rule} from '../../models';
import {PlaceRepository} from '../../repositories';

export class PlaceRuleController {
  constructor(
    @repository(PlaceRepository) protected placeRepository: PlaceRepository,
  ) {}

  @get('/places/{id}/rules', {
    responses: {
      '200': {
        description: 'Array of Place has many Rule through PlaceRule',
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
    return this.placeRepository.rules(id).find(filter);
  }

  @post('/places/{id}/rules', {
    responses: {
      '200': {
        description: 'create a Rule model instance',
        content: {'application/json': {schema: getModelSchemaRef(Rule)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Place.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Rule, {
            title: 'NewRuleInPlace',
            exclude: ['id'],
          }),
        },
      },
    })
    rule: Omit<Rule, 'id'>,
  ): Promise<Rule> {
    return this.placeRepository.rules(id).create(rule);
  }

  @patch('/places/{id}/rules', {
    responses: {
      '200': {
        description: 'Place.Rule PATCH success count',
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
    return this.placeRepository.rules(id).patch(rule, where);
  }

  @del('/places/{id}/rules', {
    responses: {
      '200': {
        description: 'Place.Rule DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Rule)) where?: Where<Rule>,
  ): Promise<Count> {
    return this.placeRepository.rules(id).delete(where);
  }
}
