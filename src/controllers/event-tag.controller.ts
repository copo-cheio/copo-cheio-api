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
    Event,
    Tag
} from '../models';
import { EventRepository } from '../repositories';

export class EventTagController {
  constructor(
    @repository(EventRepository) protected eventRepository: EventRepository,
  ) { }

  @get('/events/{id}/tags', {
    responses: {
      '200': {
        description: 'Array of Event has many Tag through TagRelations',
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
    return this.eventRepository.tags(id).find(filter);
  }

  @post('/events/{id}/tags', {
    responses: {
      '200': {
        description: 'create a Tag model instance',
        content: {'application/json': {schema: getModelSchemaRef(Tag)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Event.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          exclude: ["id", "updated_at", "created_at"],
          schema: getModelSchemaRef(Tag, {
            title: 'NewTagInEvent',
            exclude: ["id", "updated_at", "created_at"],
          }),
        },
      },
    }) tag: Omit<Tag, 'id'>,
  ): Promise<Tag> {
    return this.eventRepository.tags(id).create(tag);
  }

  @patch('/events/{id}/tags', {
    responses: {
      '200': {
        description: 'Event.Tag PATCH success count',
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
    return this.eventRepository.tags(id).patch(tag, where);
  }

  @del('/events/{id}/tags', {
    responses: {
      '200': {
        description: 'Event.Tag DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Tag)) where?: Where<Tag>,
  ): Promise<Count> {
    return this.eventRepository.tags(id).delete(where);
  }
}
