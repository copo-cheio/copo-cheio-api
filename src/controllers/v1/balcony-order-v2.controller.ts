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
import {Balcony, OrderV2} from '../../models';
import {BalconyRepository} from '../../repositories';

export class BalconyOrderV2Controller {
  constructor(
    @repository(BalconyRepository)
    protected balconyRepository: BalconyRepository,
  ) {}

  @get('/balconies/{id}/order-v2s', {
    responses: {
      '200': {
        description: 'Array of Balcony has many OrderV2',
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
    return this.balconyRepository.ordersV2(id).find(filter);
  }

  @post('/balconies/{id}/order-v2s', {
    responses: {
      '200': {
        description: 'Balcony model instance',
        content: {'application/json': {schema: getModelSchemaRef(OrderV2)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Balcony.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderV2, {
            title: 'NewOrderV2InBalcony',
            exclude: ['id'],
            optional: ['balconyId'],
          }),
        },
      },
    })
    orderV2: Omit<OrderV2, 'id'>,
  ): Promise<OrderV2> {
    return this.balconyRepository.ordersV2(id).create(orderV2);
  }

  @patch('/balconies/{id}/order-v2s', {
    responses: {
      '200': {
        description: 'Balcony.OrderV2 PATCH success count',
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
    @param.query.object('where', getWhereSchemaFor(OrderV2))
    where?: Where<OrderV2>,
  ): Promise<Count> {
    return this.balconyRepository.ordersV2(id).patch(orderV2, where);
  }

  @del('/balconies/{id}/order-v2s', {
    responses: {
      '200': {
        description: 'Balcony.OrderV2 DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(OrderV2))
    where?: Where<OrderV2>,
  ): Promise<Count> {
    return this.balconyRepository.ordersV2(id).delete(where);
  }
}
