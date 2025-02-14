import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  OrderItemsV2,
  MenuProduct,
} from '../models';
import {OrderItemsV2Repository} from '../repositories';

export class OrderItemsV2MenuProductController {
  constructor(
    @repository(OrderItemsV2Repository)
    public orderItemsV2Repository: OrderItemsV2Repository,
  ) { }

  @get('/order-items-v2s/{id}/menu-product', {
    responses: {
      '200': {
        description: 'MenuProduct belonging to OrderItemsV2',
        content: {
          'application/json': {
            schema: getModelSchemaRef(MenuProduct),
          },
        },
      },
    },
  })
  async getMenuProduct(
    @param.path.string('id') id: typeof OrderItemsV2.prototype.id,
  ): Promise<MenuProduct> {
    return this.orderItemsV2Repository.menuProduct(id);
  }
}
