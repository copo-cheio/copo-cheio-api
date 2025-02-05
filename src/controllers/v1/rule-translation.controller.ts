import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Rule, Translation} from '../../models/v1';
import {RuleRepository} from '../../repositories/v1';

export class RuleTranslationController {
  constructor(
    @repository(RuleRepository)
    public ruleRepository: RuleRepository,
  ) {}

  @get('/rules/{id}/translation', {
    responses: {
      '200': {
        description: 'Translation belonging to Rule',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Translation),
          },
        },
      },
    },
  })
  async getTranslation(
    @param.path.string('id') id: typeof Rule.prototype.id,
  ): Promise<Translation> {
    return this.ruleRepository.translation(id);
  }
  async getValueTranslation(
    @param.path.string('id') id: typeof Rule.prototype.id,
  ): Promise<Translation> {
    return this.ruleRepository.translation(id);
  }
}
