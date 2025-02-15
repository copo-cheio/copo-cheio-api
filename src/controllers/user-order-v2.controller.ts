import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  User,
  OrderV2,
} from '../models';
import {UserRepository} from '../repositories';

export class UserOrderV2Controller {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  @get('/users/{id}/order-v2s', {
    responses: {
      '200': {
        description: 'Array of User has many OrderV2',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(OrderV2)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<OrderV2>,
  ): Promise<OrderV2[]> {
    return this.userRepository.ordersV2(id).find(filter);
  }

  @post('/users/{id}/order-v2s', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(OrderV2)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderV2, {
            title: 'NewOrderV2InUser',
            exclude: ['id'],
            optional: ['userId']
          }),
        },
      },
    }) orderV2: Omit<OrderV2, 'id'>,
  ): Promise<OrderV2> {
    return this.userRepository.ordersV2(id).create(orderV2);
  }

  @patch('/users/{id}/order-v2s', {
    responses: {
      '200': {
        description: 'User.OrderV2 PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderV2, {partial: true}),
        },
      },
    })
    orderV2: Partial<OrderV2>,
    @param.query.object('where', getWhereSchemaFor(OrderV2)) where?: Where<OrderV2>,
  ): Promise<Count> {
    return this.userRepository.ordersV2(id).patch(orderV2, where);
  }

  @del('/users/{id}/order-v2s', {
    responses: {
      '200': {
        description: 'User.OrderV2 DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(OrderV2)) where?: Where<OrderV2>,
  ): Promise<Count> {
    return this.userRepository.ordersV2(id).delete(where);
  }
}
