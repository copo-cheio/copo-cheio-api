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
import {ShoppingCart, User} from '../../models';
import {UserRepository} from '../../repositories';

export class UserShoppingCartController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) {}

  @get('/users/{id}/shopping-cart', {
    responses: {
      '200': {
        description: 'User has one ShoppingCart',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ShoppingCart),
          },
        },
      },
    },
  })
  async get(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<ShoppingCart>,
  ): Promise<ShoppingCart> {
    return this.userRepository.shoppingCart(id).get(filter);
  }

  @post('/users/{id}/shopping-cart', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(ShoppingCart)},
        },
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ShoppingCart, {
            title: 'NewShoppingCartInUser',
            exclude: ['id'],
            optional: ['userId'],
          }),
        },
      },
    })
    shoppingCart: Omit<ShoppingCart, 'id'>,
  ): Promise<ShoppingCart> {
    return this.userRepository.shoppingCart(id).create(shoppingCart);
  }

  @patch('/users/{id}/shopping-cart', {
    responses: {
      '200': {
        description: 'User.ShoppingCart PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ShoppingCart, {partial: true}),
        },
      },
    })
    shoppingCart: Partial<ShoppingCart>,
    @param.query.object('where', getWhereSchemaFor(ShoppingCart))
    where?: Where<ShoppingCart>,
  ): Promise<Count> {
    return this.userRepository.shoppingCart(id).patch(shoppingCart, where);
  }

  @del('/users/{id}/shopping-cart', {
    responses: {
      '200': {
        description: 'User.ShoppingCart DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(ShoppingCart))
    where?: Where<ShoppingCart>,
  ): Promise<Count> {
    return this.userRepository.shoppingCart(id).delete(where);
  }
}
