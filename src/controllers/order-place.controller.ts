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
  Place,
} from '../models';
import {OrderRepository} from '../repositories';

export class OrderPlaceController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
  ) { }

  @get('/orders/{id}/place', {
    responses: {
      '200': {
        description: 'Place belonging to Order',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Place),
          },
        },
      },
    },
  })
  async getPlace(
    @param.path.string('id') id: typeof Order.prototype.id,
  ): Promise<Place> {
    return this.orderRepository.place(id);
  }
}
