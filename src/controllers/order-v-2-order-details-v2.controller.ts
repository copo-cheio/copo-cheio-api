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
import {OrderDetailsV2, OrderV2} from '../models';
import {OrderV2Repository} from '../repositories';

export class OrderV2OrderDetailsV2Controller {
  constructor(
    @repository(OrderV2Repository)
    protected orderV2Repository: OrderV2Repository,
  ) {}

  @get('/order-v2s/{id}/order-details-v2', {
    responses: {
      '200': {
        description: 'OrderV2 has one OrderDetailsV2',
        content: {
          'application/json': {
            schema: getModelSchemaRef(OrderDetailsV2),
          },
        },
      },
    },
  })
  async get(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<OrderDetailsV2>,
  ): Promise<OrderDetailsV2> {
    return this.orderV2Repository.details(id).get(filter);
  }

  @post('/order-v2s/{id}/order-details-v2', {
    responses: {
      '200': {
        description: 'OrderV2 model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(OrderDetailsV2)},
        },
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof OrderV2.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderDetailsV2, {
            title: 'NewOrderDetailsV2InOrderV2',
            exclude: ['id'],
            optional: ['orderV2Id'],
          }),
        },
      },
    })
    orderDetailsV2: Omit<OrderDetailsV2, 'id'>,
  ): Promise<OrderDetailsV2> {
    return this.orderV2Repository.details(id).create(orderDetailsV2);
  }

  @patch('/order-v2s/{id}/order-details-v2', {
    responses: {
      '200': {
        description: 'OrderV2.OrderDetailsV2 PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderDetailsV2, {partial: true}),
        },
      },
    })
    orderDetailsV2: Partial<OrderDetailsV2>,
    @param.query.object('where', getWhereSchemaFor(OrderDetailsV2))
    where?: Where<OrderDetailsV2>,
  ): Promise<Count> {
    return this.orderV2Repository.details(id).patch(orderDetailsV2, where);
  }

  @del('/order-v2s/{id}/order-details-v2', {
    responses: {
      '200': {
        description: 'OrderV2.OrderDetailsV2 DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(OrderDetailsV2))
    where?: Where<OrderDetailsV2>,
  ): Promise<Count> {
    return this.orderV2Repository.details(id).delete(where);
  }
}
