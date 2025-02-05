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
import {Balcony, Place} from '../../models/v1';
import {PlaceRepository} from '../../repositories/v1';

export class PlaceBalconyController {
  constructor(
    @repository(PlaceRepository) protected placeRepository: PlaceRepository,
  ) {}

  @get('/places/{id}/balconies', {
    responses: {
      '200': {
        description: 'Array of Place has many Balcony',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Balcony)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Balcony>,
  ): Promise<Balcony[]> {
    return this.placeRepository.balconies(id).find(filter);
  }

  @post('/places/{id}/balconies', {
    responses: {
      '200': {
        description: 'Place model instance',
        content: {'application/json': {schema: getModelSchemaRef(Balcony)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Place.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          exclude: ['id', 'updated_at', 'created_at'],
          schema: getModelSchemaRef(Balcony, {
            title: 'NewBalconyInPlace',
            exclude: ['id', 'updated_at', 'created_at'],
            optional: ['placeId'],
          }),
        },
      },
    })
    balcony: Omit<Balcony, 'id'>,
  ): Promise<Balcony> {
    return this.placeRepository.balconies(id).create(balcony);
  }

  @patch('/places/{id}/balconies', {
    responses: {
      '200': {
        description: 'Place.Balcony PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          exclude: ['id', 'updated_at', 'created_at'],
          schema: getModelSchemaRef(Balcony, {partial: true}),
        },
      },
    })
    balcony: Partial<Balcony>,
    @param.query.object('where', getWhereSchemaFor(Balcony))
    where?: Where<Balcony>,
  ): Promise<Count> {
    return this.placeRepository.balconies(id).patch(balcony, where);
  }

  @del('/places/{id}/balconies', {
    responses: {
      '200': {
        description: 'Place.Balcony DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Balcony))
    where?: Where<Balcony>,
  ): Promise<Count> {
    return this.placeRepository.balconies(id).delete(where);
  }
}
