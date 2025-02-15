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
  User,
  CheckInV2,
} from '../models';
import {UserRepository} from '../repositories';

export class UserCheckInV2Controller {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  @get('/users/{id}/check-in-v2', {
    responses: {
      '200': {
        description: 'User has one CheckInV2',
        content: {
          'application/json': {
            schema: getModelSchemaRef(CheckInV2),
          },
        },
      },
    },
  })
  async get(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<CheckInV2>,
  ): Promise<CheckInV2> {
    return this.userRepository.checkInV2(id).get(filter);
  }

  @post('/users/{id}/check-in-v2', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(CheckInV2)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CheckInV2, {
            title: 'NewCheckInV2InUser',
            exclude: ['id'],
            optional: ['userId']
          }),
        },
      },
    }) checkInV2: Omit<CheckInV2, 'id'>,
  ): Promise<CheckInV2> {
    return this.userRepository.checkInV2(id).create(checkInV2);
  }

  @patch('/users/{id}/check-in-v2', {
    responses: {
      '200': {
        description: 'User.CheckInV2 PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CheckInV2, {partial: true}),
        },
      },
    })
    checkInV2: Partial<CheckInV2>,
    @param.query.object('where', getWhereSchemaFor(CheckInV2)) where?: Where<CheckInV2>,
  ): Promise<Count> {
    return this.userRepository.checkInV2(id).patch(checkInV2, where);
  }

  @del('/users/{id}/check-in-v2', {
    responses: {
      '200': {
        description: 'User.CheckInV2 DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(CheckInV2)) where?: Where<CheckInV2>,
  ): Promise<Count> {
    return this.userRepository.checkInV2(id).delete(where);
  }
}
