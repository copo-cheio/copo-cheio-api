import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {Menu, MenuProduct} from '../../models';
import {MenuRepository} from '../../repositories';

export class MenuMenuProductController {
  constructor(
    @repository(MenuRepository) protected menuRepository: MenuRepository,
  ) {}

  @get('/menus/{id}/menu-products', {
    responses: {
      '200': {
        description: 'Array of Menu has many MenuProduct',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(MenuProduct)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<MenuProduct>,
  ): Promise<MenuProduct[]> {
    return this.menuRepository.products(id).find(filter);
  }

  @post('/menus/{id}/menu-products', {
    responses: {
      '200': {
        description: 'Menu model instance',
        content: {'application/json': {schema: getModelSchemaRef(MenuProduct)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Menu.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MenuProduct, {
            title: 'NewMenuProductInMenu',
            exclude: ['id'],
            optional: ['menuId'],
          }),
        },
      },
    })
    menuProduct: Omit<MenuProduct, 'id'>,
  ): Promise<MenuProduct> {
    return this.menuRepository.products(id).create(menuProduct);
  }

  @patch('/menus/{id}/menu-products', {
    responses: {
      '200': {
        description: 'Menu.MenuProduct PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MenuProduct, {partial: true}),
        },
      },
    })
    menuProduct: Partial<MenuProduct>,
    @param.query.object('where', getWhereSchemaFor(MenuProduct))
    where?: Where<MenuProduct>,
  ): Promise<Count> {
    return this.menuRepository.products(id).patch(menuProduct, where);
  }

  @del('/menus/{id}/menu-products', {
    responses: {
      '200': {
        description: 'Menu.MenuProduct DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(MenuProduct))
    where?: Where<MenuProduct>,
  ): Promise<Count> {
    return this.menuRepository.products(id).delete(where);
  }
}
