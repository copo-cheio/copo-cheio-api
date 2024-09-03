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
  OpeningHours,
} from '../models';
import {PlaceRepository} from '../repositories';

export class PlaceOpeningHoursController {
  constructor(
    @repository(PlaceRepository) protected placeRepository: PlaceRepository,
  ) { }

  @get('/places/{id}/opening-hours', {
    responses: {
      '200': {
        description: 'Array of Place has many OpeningHours',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(OpeningHours)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<OpeningHours>,
  ): Promise<OpeningHours[]> {
    return this.placeRepository.openingHours(id).find(filter);
  }

  @post('/places/{id}/opening-hours', {
    responses: {
      '200': {
        description: 'Place model instance',
        content: {'application/json': {schema: getModelSchemaRef(OpeningHours)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Place.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OpeningHours, {
            title: 'NewOpeningHoursInPlace',
            exclude: ['id'],
            optional: ['placeId']
          }),
        },
      },
    }) openingHours: Omit<OpeningHours, 'id'>,
  ): Promise<OpeningHours> {
    return this.placeRepository.openingHours(id).create(openingHours);
  }

  @patch('/places/{id}/opening-hours', {
    responses: {
      '200': {
        description: 'Place.OpeningHours PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OpeningHours, {partial: true}),
        },
      },
    })
    openingHours: Partial<OpeningHours>,
    @param.query.object('where', getWhereSchemaFor(OpeningHours)) where?: Where<OpeningHours>,
  ): Promise<Count> {
    return this.placeRepository.openingHours(id).patch(openingHours, where);
  }

  @del('/places/{id}/opening-hours', {
    responses: {
      '200': {
        description: 'Place.OpeningHours DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(OpeningHours)) where?: Where<OpeningHours>,
  ): Promise<Count> {
    return this.placeRepository.openingHours(id).delete(where);
  }
}
