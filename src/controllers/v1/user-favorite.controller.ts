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
import {Favorite, User} from '../../models';
import {UserRepository} from '../../repositories';

export class UserFavoriteController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) {}

  @get('/users/{id}/favorites', {
    responses: {
      '200': {
        description: 'Array of User has many Favorite',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Favorite)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Favorite>,
  ): Promise<Favorite[]> {
    return this.userRepository.favorites(id).find(filter);
  }

  @post('/users/{id}/favorites', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(Favorite)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Favorite, {
            title: 'NewFavoriteInUser',
            exclude: ['id'],
            optional: ['userId'],
          }),
        },
      },
    })
    favorite: Omit<Favorite, 'id'>,
  ): Promise<Favorite> {
    return this.userRepository.favorites(id).create(favorite);
  }

  @patch('/users/{id}/favorites', {
    responses: {
      '200': {
        description: 'User.Favorite PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Favorite, {partial: true}),
        },
      },
    })
    favorite: Partial<Favorite>,
    @param.query.object('where', getWhereSchemaFor(Favorite))
    where?: Where<Favorite>,
  ): Promise<Count> {
    return this.userRepository.favorites(id).patch(favorite, where);
  }

  @del('/users/{id}/favorites', {
    responses: {
      '200': {
        description: 'User.Favorite DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Favorite))
    where?: Where<Favorite>,
  ): Promise<Count> {
    return this.userRepository.favorites(id).delete(where);
  }
}
