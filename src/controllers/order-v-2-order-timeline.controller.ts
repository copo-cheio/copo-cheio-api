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
  OrderTimeline,
} from '../models';
import {OrderV2Repository} from '../repositories';

export class OrderV2OrderTimelineController {
  constructor(
    @repository(OrderV2Repository) protected orderV2Repository: OrderV2Repository,
  ) { }

  @get('/order-v2s/{id}/order-timelines', {
    responses: {
      '200': {
        description: 'Array of OrderV2 has many OrderTimeline',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(OrderTimeline)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<OrderTimeline>,
  ): Promise<OrderTimeline[]> {
    return this.orderV2Repository.orderTimelines(id).find(filter);
  }

  @post('/order-v2s/{id}/order-timelines', {
    responses: {
      '200': {
        description: 'OrderV2 model instance',
        content: {'application/json': {schema: getModelSchemaRef(OrderTimeline)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof OrderV2.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderTimeline, {
            title: 'NewOrderTimelineInOrderV2',
            exclude: ['id'],
            optional: ['orderV2Id']
          }),
        },
      },
    }) orderTimeline: Omit<OrderTimeline, 'id'>,
  ): Promise<OrderTimeline> {
    return this.orderV2Repository.orderTimelines(id).create(orderTimeline);
  }

  @patch('/order-v2s/{id}/order-timelines', {
    responses: {
      '200': {
        description: 'OrderV2.OrderTimeline PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderTimeline, {partial: true}),
        },
      },
    })
    orderTimeline: Partial<OrderTimeline>,
    @param.query.object('where', getWhereSchemaFor(OrderTimeline)) where?: Where<OrderTimeline>,
  ): Promise<Count> {
    return this.orderV2Repository.orderTimelines(id).patch(orderTimeline, where);
  }

  @del('/order-v2s/{id}/order-timelines', {
    responses: {
      '200': {
        description: 'OrderV2.OrderTimeline DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(OrderTimeline)) where?: Where<OrderTimeline>,
  ): Promise<Count> {
    return this.orderV2Repository.orderTimelines(id).delete(where);
  }
}
