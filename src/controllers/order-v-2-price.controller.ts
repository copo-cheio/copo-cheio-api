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
  Price,
} from '../models';
import {OrderV2Repository} from '../repositories';

export class OrderV2PriceController {
  constructor(
    @repository(OrderV2Repository)
    public orderV2Repository: OrderV2Repository,
  ) { }

  @get('/order-v2s/{id}/price', {
    responses: {
      '200': {
        description: 'Price belonging to OrderV2',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Price),
          },
        },
      },
    },
  })
  async getPrice(
    @param.path.string('id') id: typeof OrderV2.prototype.id,
  ): Promise<Price> {
    return this.orderV2Repository.price(id);
  }
}
