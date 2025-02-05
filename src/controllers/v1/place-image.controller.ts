import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Image, Place} from '../../models/v1';
import {PlaceRepository} from '../../repositories/v1';

export class PlaceImageController {
  constructor(
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,
  ) {}

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
