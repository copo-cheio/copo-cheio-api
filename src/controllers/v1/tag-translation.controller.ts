import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Tag, Translation} from '../../models/v1';
import {TagRepository} from '../../repositories/v1';

export class TagTranslationController {
  constructor(
    @repository(TagRepository)
    public tagRepository: TagRepository,
  ) {}

  @get('/tags/{id}/translation', {
    responses: {
      '200': {
        description: 'Translation belonging to Tag',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Translation),
          },
        },
      },
    },
  })
  async getTranslation(
    @param.path.string('id') id: typeof Tag.prototype.id,
  ): Promise<Translation> {
    return this.tagRepository.translation(id);
  }
}
