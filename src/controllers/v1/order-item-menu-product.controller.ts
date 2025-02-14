import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {MenuProduct, OrderItem} from '../../models';
import {OrderItemRepository} from '../../repositories';

export class OrderItemMenuProductController {
  constructor(
    @repository(OrderItemRepository)
    public orderItemRepository: OrderItemRepository,
  ) {}

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
