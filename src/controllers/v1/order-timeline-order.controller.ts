import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Order, OrderTimeline} from '../../models/v1';
import {OrderTimelineRepository} from '../../repositories/v1';

export class OrderTimelineOrderController {
  constructor(
    @repository(OrderTimelineRepository)
    public orderTimelineRepository: OrderTimelineRepository,
  ) {}

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
