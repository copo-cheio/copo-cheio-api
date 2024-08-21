import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Song,
  Image,
} from '../models';
import {SongRepository} from '../repositories';

export class SongImageController {
  constructor(
    @repository(SongRepository)
    public songRepository: SongRepository,
  ) { }

  @get('/songs/{id}/image', {
    responses: {
      '200': {
        description: 'Image belonging to Song',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Image),
          },
        },
      },
    },
  })
  async getImage(
    @param.path.string('id') id: typeof Song.prototype.id,
  ): Promise<Image> {
    return this.songRepository.thumbnail(id);
  }
}
