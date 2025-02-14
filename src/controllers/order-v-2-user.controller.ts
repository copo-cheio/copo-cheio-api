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
  User,
} from '../models';
import {OrderV2Repository} from '../repositories';

export class OrderV2UserController {
  constructor(
    @repository(OrderV2Repository)
    public orderV2Repository: OrderV2Repository,
  ) { }

  @get('/order-v2s/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to OrderV2',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User),
          },
        },
      },
    },
  })
  async getUser(
    @param.path.string('id') id: typeof OrderV2.prototype.id,
  ): Promise<User> {
    return this.orderV2Repository.userV2(id);
  }
}
