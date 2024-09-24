import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  OrderItem,
  MenuProduct,
} from '../models';
import {OrderItemRepository} from '../repositories';

export class OrderItemMenuProductController {
  constructor(
    @repository(OrderItemRepository)
    public orderItemRepository: OrderItemRepository,
  ) { }

  @get('/order-items/{id}/menu-product', {
    responses: {
      '200': {
        description: 'MenuProduct belonging to OrderItem',
        content: {
          'application/json': {
            schema: getModelSchemaRef(MenuProduct),
          },
        },
      },
    },
  })
  async getMenuProduct(
    @param.path.string('id') id: typeof OrderItem.prototype.id,
  ): Promise<MenuProduct> {
    return this.orderItemRepository.menuProduct(id);
  }
}
