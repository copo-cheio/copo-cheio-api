import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  OrderTimeline,
  Order,
} from '../models';
import {OrderTimelineRepository} from '../repositories';

export class OrderTimelineOrderController {
  constructor(
    @repository(OrderTimelineRepository)
    public orderTimelineRepository: OrderTimelineRepository,
  ) { }

  @get('/order-timelines/{id}/order', {
    responses: {
      '200': {
        description: 'Order belonging to OrderTimeline',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Order),
          },
        },
      },
    },
  })
  async getOrder(
    @param.path.string('id') id: typeof OrderTimeline.prototype.id,
  ): Promise<Order> {
    return this.orderTimelineRepository.order(id);
  }
}
