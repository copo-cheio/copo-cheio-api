import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Balcony, Image} from '../../models/v1';
import {BalconyRepository} from '../../repositories/v1';

export class BalconyImageController {
  constructor(
    @repository(BalconyRepository)
    public balconyRepository: BalconyRepository,
  ) {}

  @get('/balconies/{id}/image', {
    responses: {
      '200': {
        description: 'Image belonging to Balcony',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Image),
          },
        },
      },
    },
  })
  async getImage(
    @param.path.string('id') id: typeof Balcony.prototype.id,
  ): Promise<Image> {
    return this.balconyRepository.cover(id);
  }
}
