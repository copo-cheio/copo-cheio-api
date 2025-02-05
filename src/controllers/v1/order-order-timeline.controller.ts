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
import {Order, OrderTimeline} from '../../models/v1';
import {OrderRepository} from '../../repositories/v1';

export class OrderOrderTimelineController {
  constructor(
    @repository(OrderRepository) protected orderRepository: OrderRepository,
  ) {}

  @get('/orders/{id}/order-timelines', {
    responses: {
      '200': {
        description: 'Array of Order has many OrderTimeline',
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
    return this.orderRepository.orderTimelines(id).find(filter);
  }

  @post('/orders/{id}/order-timelines', {
    responses: {
      '200': {
        description: 'Order model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(OrderTimeline)},
        },
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Order.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderTimeline, {
            title: 'NewOrderTimelineInOrder',
            exclude: ['id'],
            optional: ['orderId'],
          }),
        },
      },
    })
    orderTimeline: Omit<OrderTimeline, 'id'>,
  ): Promise<OrderTimeline> {
    return this.orderRepository.orderTimelines(id).create(orderTimeline);
  }

  @patch('/orders/{id}/order-timelines', {
    responses: {
      '200': {
        description: 'Order.OrderTimeline PATCH success count',
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
    @param.query.object('where', getWhereSchemaFor(OrderTimeline))
    where?: Where<OrderTimeline>,
  ): Promise<Count> {
    return this.orderRepository.orderTimelines(id).patch(orderTimeline, where);
  }

  @del('/orders/{id}/order-timelines', {
    responses: {
      '200': {
        description: 'Order.OrderTimeline DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(OrderTimeline))
    where?: Where<OrderTimeline>,
  ): Promise<Count> {
    return this.orderRepository.orderTimelines(id).delete(where);
  }
}
