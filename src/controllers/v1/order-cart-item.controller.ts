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
import {CartItem, Order} from '../../models/v1';
import {OrderRepository} from '../../repositories/v1';

export class OrderCartItemController {
  constructor(
    @repository(OrderRepository) protected orderRepository: OrderRepository,
  ) {}

  @get('/orders/{id}/cart-items', {
    responses: {
      '200': {
        description: 'Array of Order has many CartItem',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(CartItem)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<CartItem>,
  ): Promise<CartItem[]> {
    return this.orderRepository.cartItems(id).find(filter);
  }

  @post('/orders/{id}/cart-items', {
    responses: {
      '200': {
        description: 'Order model instance',
        content: {'application/json': {schema: getModelSchemaRef(CartItem)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Order.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CartItem, {
            title: 'NewCartItemInOrder',
            exclude: ['id'],
            optional: ['orderId'],
          }),
        },
      },
    })
    cartItem: Omit<CartItem, 'id'>,
  ): Promise<CartItem> {
    return this.orderRepository.cartItems(id).create(cartItem);
  }

  @patch('/orders/{id}/cart-items', {
    responses: {
      '200': {
        description: 'Order.CartItem PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CartItem, {partial: true}),
        },
      },
    })
    cartItem: Partial<CartItem>,
    @param.query.object('where', getWhereSchemaFor(CartItem))
    where?: Where<CartItem>,
  ): Promise<Count> {
    return this.orderRepository.cartItems(id).patch(cartItem, where);
  }

  @del('/orders/{id}/cart-items', {
    responses: {
      '200': {
        description: 'Order.CartItem DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(CartItem))
    where?: Where<CartItem>,
  ): Promise<Count> {
    return this.orderRepository.cartItems(id).delete(where);
  }
}
