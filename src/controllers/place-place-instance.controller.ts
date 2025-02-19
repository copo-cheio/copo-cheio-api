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
  PlaceInstance,
} from '../models';
import {PlaceRepository} from '../repositories';

export class PlacePlaceInstanceController {
  constructor(
    @repository(PlaceRepository) protected placeRepository: PlaceRepository,
  ) { }

  @get('/places/{id}/place-instances', {
    responses: {
      '200': {
        description: 'Array of Place has many PlaceInstance',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(PlaceInstance)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<PlaceInstance>,
  ): Promise<PlaceInstance[]> {
    return this.placeRepository.instances(id).find(filter);
  }

  @post('/places/{id}/place-instances', {
    responses: {
      '200': {
        description: 'Place model instance',
        content: {'application/json': {schema: getModelSchemaRef(PlaceInstance)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Place.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlaceInstance, {
            title: 'NewPlaceInstanceInPlace',
            exclude: ['id'],
            optional: ['placeId']
          }),
        },
      },
    }) placeInstance: Omit<PlaceInstance, 'id'>,
  ): Promise<PlaceInstance> {
    return this.placeRepository.instances(id).create(placeInstance);
  }

  @patch('/places/{id}/place-instances', {
    responses: {
      '200': {
        description: 'Place.PlaceInstance PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlaceInstance, {partial: true}),
        },
      },
    })
    placeInstance: Partial<PlaceInstance>,
    @param.query.object('where', getWhereSchemaFor(PlaceInstance)) where?: Where<PlaceInstance>,
  ): Promise<Count> {
    return this.placeRepository.instances(id).patch(placeInstance, where);
  }

  @del('/places/{id}/place-instances', {
    responses: {
      '200': {
        description: 'Place.PlaceInstance DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(PlaceInstance)) where?: Where<PlaceInstance>,
  ): Promise<Count> {
    return this.placeRepository.instances(id).delete(where);
  }
}
