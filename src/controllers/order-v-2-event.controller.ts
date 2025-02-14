import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  OrderV2,
  Event,
} from '../models';
import {OrderV2Repository} from '../repositories';

export class OrderV2EventController {
  constructor(
    @repository(OrderV2Repository)
    public orderV2Repository: OrderV2Repository,
  ) { }

  @get('/order-v2s/{id}/event', {
    responses: {
      '200': {
        description: 'Event belonging to OrderV2',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Event),
          },
        },
      },
    },
  })
  async getEvent(
    @param.path.string('id') id: typeof OrderV2.prototype.id,
  ): Promise<Event> {
    return this.orderV2Repository.event(id);
  }
}
