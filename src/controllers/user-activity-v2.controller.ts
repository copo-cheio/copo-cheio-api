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
  ActivityV2,
} from '../models';
import {UserRepository} from '../repositories';

export class UserActivityV2Controller {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  @get('/users/{id}/activity-v2s', {
    responses: {
      '200': {
        description: 'Array of User has many ActivityV2',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(ActivityV2)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<ActivityV2>,
  ): Promise<ActivityV2[]> {
    return this.userRepository.activitiesV2(id).find(filter);
  }

  @post('/users/{id}/activity-v2s', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(ActivityV2)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ActivityV2, {
            title: 'NewActivityV2InUser',
            exclude: ['id'],
            optional: ['userId']
          }),
        },
      },
    }) activityV2: Omit<ActivityV2, 'id'>,
  ): Promise<ActivityV2> {
    return this.userRepository.activitiesV2(id).create(activityV2);
  }

  @patch('/users/{id}/activity-v2s', {
    responses: {
      '200': {
        description: 'User.ActivityV2 PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ActivityV2, {partial: true}),
        },
      },
    })
    activityV2: Partial<ActivityV2>,
    @param.query.object('where', getWhereSchemaFor(ActivityV2)) where?: Where<ActivityV2>,
  ): Promise<Count> {
    return this.userRepository.activitiesV2(id).patch(activityV2, where);
  }

  @del('/users/{id}/activity-v2s', {
    responses: {
      '200': {
        description: 'User.ActivityV2 DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(ActivityV2)) where?: Where<ActivityV2>,
  ): Promise<Count> {
    return this.userRepository.activitiesV2(id).delete(where);
  }
}
