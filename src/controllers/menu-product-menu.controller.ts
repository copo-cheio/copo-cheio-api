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
  Menu,
} from '../models';
import {MenuProductRepository} from '../repositories';

export class MenuProductMenuController {
  constructor(
    @repository(MenuProductRepository)
    public menuProductRepository: MenuProductRepository,
  ) { }

  @get('/menu-products/{id}/menu', {
    responses: {
      '200': {
        description: 'Menu belonging to MenuProduct',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Menu),
          },
        },
      },
    },
  })
  async getMenu(
    @param.path.string('id') id: typeof MenuProduct.prototype.id,
  ): Promise<Menu> {
    return this.menuProductRepository.menu(id);
  }
}
