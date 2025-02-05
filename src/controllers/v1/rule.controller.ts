import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {Rule} from '../../models/v1';
import {RuleRepository} from '../../repositories/v1';

export class RuleController {
  constructor(
    @repository(RuleRepository)
    public ruleRepository: RuleRepository,
  ) {}

  @post('/rules')
  @response(200, {
    description: 'Rule model instance',
    content: {'application/json': {schema: getModelSchemaRef(Rule)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Rule, {
            title: 'NewRule',
            exclude: ['id'],
          }),
        },
      },
    })
    rule: Omit<Rule, 'id'>,
  ): Promise<Rule> {
    return this.ruleRepository.create(rule);
  }

  @get('/rules/count')
  @response(200, {
    description: 'Rule model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Rule) where?: Where<Rule>): Promise<Count> {
    return this.ruleRepository.count(where);
  }

  @get('/rules')
  @response(200, {
    description: 'Array of Rule model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Rule, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Rule) filter?: Filter<Rule>): Promise<Rule[]> {
    return this.ruleRepository.find(filter);
  }

  @patch('/rules')
  @response(200, {
    description: 'Rule PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Rule, {partial: true}),
        },
      },
    })
    rule: Rule,
    @param.where(Rule) where?: Where<Rule>,
  ): Promise<Count> {
    return this.ruleRepository.updateAll(rule, where);
  }

  @get('/rules/{id}')
  @response(200, {
    description: 'Rule model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Rule, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Rule, {exclude: 'where'}) filter?: FilterExcludingWhere<Rule>,
  ): Promise<Rule> {
    return this.ruleRepository.findById(id, filter);
  }

  @patch('/rules/{id}')
  @response(204, {
    description: 'Rule PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Rule, {partial: true}),
        },
      },
    })
    rule: Rule,
  ): Promise<void> {
    await this.ruleRepository.updateById(id, rule);
  }

  @put('/rules/{id}')
  @response(204, {
    description: 'Rule PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() rule: Rule,
  ): Promise<void> {
    await this.ruleRepository.replaceById(id, rule);
  }

  @del('/rules/{id}')
  @response(204, {
    description: 'Rule DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.ruleRepository.deleteById(id);
  }
}
