import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  OrderTimeline,
  User,
} from '../models';
import {OrderTimelineRepository} from '../repositories';

export class OrderTimelineUserController {
  constructor(
    @repository(OrderTimelineRepository)
    public orderTimelineRepository: OrderTimelineRepository,
  ) { }

  @get('/order-timelines/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to OrderTimeline',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User),
          },
        },
      },
    },
  })
  async getUser(
    @param.path.string('id') id: typeof OrderTimeline.prototype.id,
  ): Promise<User> {
    return this.orderTimelineRepository.staff(id);
  }
}
