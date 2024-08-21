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
    Tag
} from '../models';
import { PlaceRepository } from '../repositories';

export class PlaceTagController {
  constructor(
    @repository(PlaceRepository) protected placeRepository: PlaceRepository,
  ) { }

  @get('/places/{id}/tags', {
    responses: {
      '200': {
        description: 'Array of Place has many Tag through TagRelations',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Tag)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Tag>,
  ): Promise<Tag[]> {
    return this.placeRepository.tags(id).find(filter);
  }

  @post('/places/{id}/tags', {
    responses: {
      '200': {
        description: 'create a Tag model instance',
        content: {'application/json': {schema: getModelSchemaRef(Tag)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Place.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          exclude: ["id", "updated_at", "created_at"],
          schema: getModelSchemaRef(Tag, {
            title: 'NewTagInPlace',
            exclude: ["id", "updated_at", "created_at"],
          }),
        },
      },
    }) tag: Omit<Tag, 'id'>,
  ): Promise<Tag> {
    return this.placeRepository.tags(id).create(tag);
  }

  @patch('/places/{id}/tags', {
    responses: {
      '200': {
        description: 'Place.Tag PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          exclude: ["id", "updated_at", "created_at"],
          schema: getModelSchemaRef(Tag, {partial: true}),
        },
      },
    })
    tag: Partial<Tag>,
    @param.query.object('where', getWhereSchemaFor(Tag)) where?: Where<Tag>,
  ): Promise<Count> {
    return this.placeRepository.tags(id).patch(tag, where);
  }

  @del('/places/{id}/tags', {
    responses: {
      '200': {
        description: 'Place.Tag DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Tag)) where?: Where<Tag>,
  ): Promise<Count> {
    return this.placeRepository.tags(id).delete(where);
  }
}
