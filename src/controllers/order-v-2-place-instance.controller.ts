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
  PlaceInstance,
} from '../models';
import {OrderV2Repository} from '../repositories';

export class OrderV2PlaceInstanceController {
  constructor(
    @repository(OrderV2Repository)
    public orderV2Repository: OrderV2Repository,
  ) { }

  @get('/order-v2s/{id}/place-instance', {
    responses: {
      '200': {
        description: 'PlaceInstance belonging to OrderV2',
        content: {
          'application/json': {
            schema: getModelSchemaRef(PlaceInstance),
          },
        },
      },
    },
  })
  async getPlaceInstance(
    @param.path.string('id') id: typeof OrderV2.prototype.id,
  ): Promise<PlaceInstance> {
    return this.orderV2Repository.placeInstance(id);
  }
}
