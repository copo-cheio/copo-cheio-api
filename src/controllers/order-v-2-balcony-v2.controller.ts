import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';

import {Balcony, OrderV2} from '../models';
import {OrderV2Repository} from '../repositories';

export class OrderV2BalconyController {
  constructor(
    @repository(OrderV2Repository)
    public orderV2Repository: OrderV2Repository,
  ) {}

  @get('/order-v2s/{id}/balcony-v2', {
    responses: {
      '200': {
        description: 'BalconyV2 belonging to OrderV2',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Balcony),
          },
        },
      },
    },
  })
  async getBalcony(
    @param.path.string('id') id: typeof OrderV2.prototype.id,
  ): Promise<Balcony> {
    return this.orderV2Repository.balcony(id);
  }
}
