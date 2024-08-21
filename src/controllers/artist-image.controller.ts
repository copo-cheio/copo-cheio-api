import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Artist,
  Image,
} from '../models';
import {ArtistRepository} from '../repositories';

export class ArtistImageController {
  constructor(
    @repository(ArtistRepository)
    public artistRepository: ArtistRepository,
  ) { }

  @get('/artists/{id}/image', {
    responses: {
      '200': {
        description: 'Image belonging to Artist',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Image),
          },
        },
      },
    },
  })
  async getImage(
    @param.path.string('id') id: typeof Artist.prototype.id,
  ): Promise<Image> {
    return this.artistRepository.cover(id);
  }
}
