import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {CartItem} from '../../models';
import {CartItemRepository} from '../../repositories';

export class ShoppingCartControllerController {
  constructor(
    @repository(CartItemRepository)
    public cartItemRepository: CartItemRepository,
  ) {}

  @post('/cart-items')
  @response(200, {
    description: 'CartItem model instance',
    content: {'application/json': {schema: getModelSchemaRef(CartItem)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CartItem, {
            title: 'NewCartItem',
            exclude: ['id'],
          }),
        },
      },
    })
    cartItem: Omit<CartItem, 'id'>,
  ): Promise<CartItem> {
    return this.cartItemRepository.create(cartItem);
  }

  @get('/cart-items/count')
  @response(200, {
    description: 'CartItem model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(CartItem) where?: Where<CartItem>): Promise<Count> {
    return this.cartItemRepository.count(where);
  }

  @get('/cart-items')
  @response(200, {
    description: 'Array of CartItem model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(CartItem, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(CartItem) filter?: Filter<CartItem>,
  ): Promise<CartItem[]> {
    return this.cartItemRepository.find(filter);
  }

  @patch('/cart-items')
  @response(200, {
    description: 'CartItem PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CartItem, {partial: true}),
        },
      },
    })
    cartItem: CartItem,
    @param.where(CartItem) where?: Where<CartItem>,
  ): Promise<Count> {
    return this.cartItemRepository.updateAll(cartItem, where);
  }

  @get('/cart-items/{id}')
  @response(200, {
    description: 'CartItem model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(CartItem, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(CartItem, {exclude: 'where'})
    filter?: FilterExcludingWhere<CartItem>,
  ): Promise<CartItem> {
    return this.cartItemRepository.findById(id, filter);
  }

  @patch('/cart-items/{id}')
  @response(204, {
    description: 'CartItem PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CartItem, {partial: true}),
        },
      },
    })
    cartItem: CartItem,
  ): Promise<void> {
    await this.cartItemRepository.updateById(id, cartItem);
  }

  @put('/cart-items/{id}')
  @response(204, {
    description: 'CartItem PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() cartItem: CartItem,
  ): Promise<void> {
    await this.cartItemRepository.replaceById(id, cartItem);
  }

  @del('/cart-items/{id}')
  @response(204, {
    description: 'CartItem DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.cartItemRepository.deleteById(id);
  }
}
