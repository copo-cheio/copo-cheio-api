import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Event, Order} from '../../models';
import {OrderRepository} from '../../repositories';

export class OrderEventController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
  ) {}

  @get('/orders/{id}/event', {
    responses: {
      '200': {
        description: 'Event belonging to Order',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Event),
          },
        },
      },
    },
  })
  async getEvent(
    @param.path.string('id') id: typeof Order.prototype.id,
  ): Promise<Event> {
    return this.orderRepository.event(id);
  }
}
