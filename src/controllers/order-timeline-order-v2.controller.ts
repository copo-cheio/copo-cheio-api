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
  OrderV2,
} from '../models';
import {OrderTimelineRepository} from '../repositories';

export class OrderTimelineOrderV2Controller {
  constructor(
    @repository(OrderTimelineRepository)
    public orderTimelineRepository: OrderTimelineRepository,
  ) { }

  @get('/order-timelines/{id}/order-v2', {
    responses: {
      '200': {
        description: 'OrderV2 belonging to OrderTimeline',
        content: {
          'application/json': {
            schema: getModelSchemaRef(OrderV2),
          },
        },
      },
    },
  })
  async getOrderV2(
    @param.path.string('id') id: typeof OrderTimeline.prototype.id,
  ): Promise<OrderV2> {
    return this.orderTimelineRepository.orderV2(id);
  }
}
