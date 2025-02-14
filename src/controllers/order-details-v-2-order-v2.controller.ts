import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  OrderDetailsV2,
  OrderV2,
} from '../models';
import {OrderDetailsV2Repository} from '../repositories';

export class OrderDetailsV2OrderV2Controller {
  constructor(
    @repository(OrderDetailsV2Repository)
    public orderDetailsV2Repository: OrderDetailsV2Repository,
  ) { }

  @get('/order-details-v2s/{id}/order-v2', {
    responses: {
      '200': {
        description: 'OrderV2 belonging to OrderDetailsV2',
        content: {
          'application/json': {
            schema: getModelSchemaRef(OrderV2),
          },
        },
      },
    },
  })
  async getOrderV2(
    @param.path.string('id') id: typeof OrderDetailsV2.prototype.id,
  ): Promise<OrderV2> {
    return this.orderDetailsV2Repository.orderV2(id);
  }
}
