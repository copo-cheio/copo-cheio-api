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
  Place,
} from '../models';
import {OrderV2Repository} from '../repositories';

export class OrderV2PlaceController {
  constructor(
    @repository(OrderV2Repository)
    public orderV2Repository: OrderV2Repository,
  ) { }

  @get('/order-v2s/{id}/place', {
    responses: {
      '200': {
        description: 'Place belonging to OrderV2',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Place),
          },
        },
      },
    },
  })
  async getPlace(
    @param.path.string('id') id: typeof OrderV2.prototype.id,
  ): Promise<Place> {
    return this.orderV2Repository.place(id);
  }
}
