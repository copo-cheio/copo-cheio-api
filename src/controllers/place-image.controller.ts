import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Place,
  Image,
} from '../models';
import {PlaceRepository} from '../repositories';

export class PlaceImageController {
  constructor(
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,
  ) { }

  @get('/places/{id}/image', {
    responses: {
      '200': {
        description: 'Image belonging to Place',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Image),
          },
        },
      },
    },
  })
  async getImage(
    @param.path.string('id') id: typeof Place.prototype.id,
  ): Promise<Image> {
    return this.placeRepository.cover(id);
  }
}
