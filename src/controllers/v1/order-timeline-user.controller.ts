import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {OrderTimeline, User} from '../../models/v1';
import {OrderTimelineRepository} from '../../repositories/v1';

export class OrderTimelineUserController {
  constructor(
    @repository(OrderTimelineRepository)
    public orderTimelineRepository: OrderTimelineRepository,
  ) {}

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
