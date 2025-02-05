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
import {OrderSingleFull} from '../../blueprints/shared/order.include';
import {Balcony, Order} from '../../models/v1';
import {BalconyRepository} from '../../repositories/v1';

export class BalconyOrderController {
  constructor(
    @repository(BalconyRepository)
    protected balconyRepository: BalconyRepository,
  ) {}

  @get('/balconies/{id}/orders', {
    responses: {
      '200': {
        description: 'Array of Balcony has many Order',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Order)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Order>,
  ): Promise<Order[]> {
    const dbQuery = OrderSingleFull;
    dbQuery.order = 'created_at DESC';
    return this.balconyRepository.orders(id).find(dbQuery);
  }

  @post('/balconies/{id}/orders', {
    responses: {
      '200': {
        description: 'Balcony model instance',
        content: {'application/json': {schema: getModelSchemaRef(Order)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Balcony.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {
            title: 'NewOrderInBalcony',
            exclude: ['id'],
            optional: ['balconyId'],
          }),
        },
      },
    })
    order: Omit<Order, 'id'>,
  ): Promise<Order> {
    return this.balconyRepository.orders(id).create(order);
  }

  @patch('/balconies/{id}/orders', {
    responses: {
      '200': {
        description: 'Balcony.Order PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {partial: true}),
        },
      },
    })
    order: Partial<Order>,
    @param.query.object('where', getWhereSchemaFor(Order)) where?: Where<Order>,
  ): Promise<Count> {
    return this.balconyRepository.orders(id).patch(order, where);
  }

  @del('/balconies/{id}/orders', {
    responses: {
      '200': {
        description: 'Balcony.Order DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Order)) where?: Where<Order>,
  ): Promise<Count> {
    return this.balconyRepository.orders(id).delete(where);
  }
}
