/* import {
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
import {OrderItemOptionsV2, OrderItemsV2} from '../models';
import {OrderItemsV2Repository} from '../repositories';

export class OrderItemsV2OrderItemOptionsV2Controller {
  constructor(
    @repository(OrderItemsV2Repository)
    protected orderItemsV2Repository: OrderItemsV2Repository,
  ) {}

  @get('/order-items-v2s/{id}/order-item-options-v2s', {
    responses: {
      '200': {
        description: 'Array of OrderItemsV2 has many OrderItemOptionsV2',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(OrderItemOptionsV2),
            },
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<OrderItemOptionsV2>,
  ): Promise<OrderItemOptionsV2[]> {
    return this.orderItemsV2Repository.optionsV2(id).find(filter);
  }

  @post('/order-items-v2s/{id}/order-item-options-v2s', {
    responses: {
      '200': {
        description: 'OrderItemsV2 model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(OrderItemOptionsV2)},
        },
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof OrderItemsV2.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderItemOptionsV2, {
            title: 'NewOrderItemOptionsV2InOrderItemsV2',
            exclude: ['id'],
            optional: ['orderItemsV2Id'],
          }),
        },
      },
    })
    orderItemOptionsV2: Omit<OrderItemOptionsV2, 'id'>,
  ): Promise<OrderItemOptionsV2> {
    return this.orderItemsV2Repository.optionsV2(id).create(orderItemOptionsV2);
  }

  @patch('/order-items-v2s/{id}/order-item-options-v2s', {
    responses: {
      '200': {
        description: 'OrderItemsV2.OrderItemOptionsV2 PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderItemOptionsV2, {partial: true}),
        },
      },
    })
    orderItemOptionsV2: Partial<OrderItemOptionsV2>,
    @param.query.object('where', getWhereSchemaFor(OrderItemOptionsV2))
    where?: Where<OrderItemOptionsV2>,
  ): Promise<Count> {
    return this.orderItemsV2Repository
      .optionsV2(id)
      .patch(orderItemOptionsV2, where);
  }

  @del('/order-items-v2s/{id}/order-item-options-v2s', {
    responses: {
      '200': {
        description: 'OrderItemsV2.OrderItemOptionsV2 DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(OrderItemOptionsV2))
    where?: Where<OrderItemOptionsV2>,
  ): Promise<Count> {
    return this.orderItemsV2Repository.optionsV2(id).delete(where);
  }
}
 */
