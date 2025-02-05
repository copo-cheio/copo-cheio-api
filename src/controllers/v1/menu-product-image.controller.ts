import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Image, MenuProduct} from '../../models/v1';
import {MenuProductRepository} from '../../repositories/v1';

export class MenuProductImageController {
  constructor(
    @repository(MenuProductRepository)
    public menuProductRepository: MenuProductRepository,
  ) {}

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
