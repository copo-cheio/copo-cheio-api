import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Order,
  Price,
} from '../models';
import {OrderRepository} from '../repositories';

export class OrderPriceController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
  ) { }

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
