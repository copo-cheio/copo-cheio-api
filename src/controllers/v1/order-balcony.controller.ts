import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Balcony, Order} from '../../models/v1';
import {OrderRepository} from '../../repositories/v1';

export class OrderBalconyController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
  ) {}

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
