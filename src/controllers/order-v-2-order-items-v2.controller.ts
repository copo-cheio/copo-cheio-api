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
  OrderV2,
  OrderItemsV2,
} from '../models';
import {OrderV2Repository} from '../repositories';

export class OrderV2OrderItemsV2Controller {
  constructor(
    @repository(OrderV2Repository) protected orderV2Repository: OrderV2Repository,
  ) { }

  @get('/order-v2s/{id}/order-items-v2s', {
    responses: {
      '200': {
        description: 'Array of OrderV2 has many OrderItemsV2',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(OrderItemsV2)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<OrderItemsV2>,
  ): Promise<OrderItemsV2[]> {
    return this.orderV2Repository.items(id).find(filter);
  }

  @post('/order-v2s/{id}/order-items-v2s', {
    responses: {
      '200': {
        description: 'OrderV2 model instance',
        content: {'application/json': {schema: getModelSchemaRef(OrderItemsV2)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof OrderV2.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderItemsV2, {
            title: 'NewOrderItemsV2InOrderV2',
            exclude: ['id'],
            optional: ['orderV2Id']
          }),
        },
      },
    }) orderItemsV2: Omit<OrderItemsV2, 'id'>,
  ): Promise<OrderItemsV2> {
    return this.orderV2Repository.items(id).create(orderItemsV2);
  }

  @patch('/order-v2s/{id}/order-items-v2s', {
    responses: {
      '200': {
        description: 'OrderV2.OrderItemsV2 PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderItemsV2, {partial: true}),
        },
      },
    })
    orderItemsV2: Partial<OrderItemsV2>,
    @param.query.object('where', getWhereSchemaFor(OrderItemsV2)) where?: Where<OrderItemsV2>,
  ): Promise<Count> {
    return this.orderV2Repository.items(id).patch(orderItemsV2, where);
  }

  @del('/order-v2s/{id}/order-items-v2s', {
    responses: {
      '200': {
        description: 'OrderV2.OrderItemsV2 DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(OrderItemsV2)) where?: Where<OrderItemsV2>,
  ): Promise<Count> {
    return this.orderV2Repository.items(id).delete(where);
  }
}
