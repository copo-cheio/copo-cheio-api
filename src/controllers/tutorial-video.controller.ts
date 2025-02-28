import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Tutorial,
  Video,
} from '../models';
import {TutorialRepository} from '../repositories';

export class TutorialVideoController {
  constructor(
    @repository(TutorialRepository)
    public tutorialRepository: TutorialRepository,
  ) { }

  @get('/tutorials/{id}/video', {
    responses: {
      '200': {
        description: 'Video belonging to Tutorial',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Video),
          },
        },
      },
    },
  })
  async getVideo(
    @param.path.string('id') id: typeof Tutorial.prototype.id,
  ): Promise<Video> {
    return this.tutorialRepository.video(id);
  }
}
