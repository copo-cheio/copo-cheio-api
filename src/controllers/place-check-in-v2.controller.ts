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
  Place,
  CheckInV2,
} from '../models';
import {PlaceRepository} from '../repositories';

export class PlaceCheckInV2Controller {
  constructor(
    @repository(PlaceRepository) protected placeRepository: PlaceRepository,
  ) { }

  @get('/places/{id}/check-in-v2s', {
    responses: {
      '200': {
        description: 'Array of Place has many CheckInV2',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(CheckInV2)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<CheckInV2>,
  ): Promise<CheckInV2[]> {
    return this.placeRepository.checkInsV2(id).find(filter);
  }

  @post('/places/{id}/check-in-v2s', {
    responses: {
      '200': {
        description: 'Place model instance',
        content: {'application/json': {schema: getModelSchemaRef(CheckInV2)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Place.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CheckInV2, {
            title: 'NewCheckInV2InPlace',
            exclude: ['id'],
            optional: ['placeId']
          }),
        },
      },
    }) checkInV2: Omit<CheckInV2, 'id'>,
  ): Promise<CheckInV2> {
    return this.placeRepository.checkInsV2(id).create(checkInV2);
  }

  @patch('/places/{id}/check-in-v2s', {
    responses: {
      '200': {
        description: 'Place.CheckInV2 PATCH success count',
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
    return this.placeRepository.checkInsV2(id).patch(checkInV2, where);
  }

  @del('/places/{id}/check-in-v2s', {
    responses: {
      '200': {
        description: 'Place.CheckInV2 DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(CheckInV2)) where?: Where<CheckInV2>,
  ): Promise<Count> {
    return this.placeRepository.checkInsV2(id).delete(where);
  }
}
