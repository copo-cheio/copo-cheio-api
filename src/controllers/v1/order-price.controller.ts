import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Order, Price} from '../../models/v1';
import {OrderRepository} from '../../repositories/v1';

export class OrderPriceController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
  ) {}

  @get('/orders/{id}/price', {
    responses: {
      '200': {
        description: 'Price belonging to Order',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Price),
          },
        },
      },
    },
  })
  async getPrice(
    @param.path.string('id') id: typeof Order.prototype.id,
  ): Promise<Price> {
    return this.orderRepository.price(id);
  }
}
