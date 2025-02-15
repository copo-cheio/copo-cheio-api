import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  CheckInV2,
  OrderV2,
} from '../models';
import {CheckInV2Repository} from '../repositories';

export class CheckInV2OrderV2Controller {
  constructor(
    @repository(CheckInV2Repository)
    public checkInV2Repository: CheckInV2Repository,
  ) { }

  @get('/check-in-v2s/{id}/order-v2', {
    responses: {
      '200': {
        description: 'OrderV2 belonging to CheckInV2',
        content: {
          'application/json': {
            schema: getModelSchemaRef(OrderV2),
          },
        },
      },
    },
  })
  async getOrderV2(
    @param.path.string('id') id: typeof CheckInV2.prototype.id,
  ): Promise<OrderV2> {
    return this.checkInV2Repository.orderV2(id);
  }
}
