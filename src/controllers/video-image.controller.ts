import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Video,
  Image,
} from '../models';
import {VideoRepository} from '../repositories';

export class VideoImageController {
  constructor(
    @repository(VideoRepository)
    public videoRepository: VideoRepository,
  ) { }

  @get('/videos/{id}/image', {
    responses: {
      '200': {
        description: 'Image belonging to Video',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Image),
          },
        },
      },
    },
  })
  async getImage(
    @param.path.string('id') id: typeof Video.prototype.id,
  ): Promise<Image> {
    return this.videoRepository.cover(id);
  }
}
