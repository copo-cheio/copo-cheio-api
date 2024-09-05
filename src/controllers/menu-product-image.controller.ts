import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  MenuProduct,
  Image,
} from '../models';
import {MenuProductRepository} from '../repositories';

export class MenuProductImageController {
  constructor(
    @repository(MenuProductRepository)
    public menuProductRepository: MenuProductRepository,
  ) { }

  @get('/menu-products/{id}/image', {
    responses: {
      '200': {
        description: 'Image belonging to MenuProduct',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Image),
          },
        },
      },
    },
  })
  async getImage(
    @param.path.string('id') id: typeof MenuProduct.prototype.id,
  ): Promise<Image> {
    return this.menuProductRepository.thumbnail(id);
  }
}
