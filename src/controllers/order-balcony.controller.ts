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
  Balcony,
} from '../models';
import {OrderRepository} from '../repositories';

export class OrderBalconyController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
  ) { }

  @get('/orders/{id}/balcony', {
    responses: {
      '200': {
        description: 'Balcony belonging to Order',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Balcony),
          },
        },
      },
    },
  })
  async getBalcony(
    @param.path.string('id') id: typeof Order.prototype.id,
  ): Promise<Balcony> {
    return this.orderRepository.balcony(id);
  }
}
