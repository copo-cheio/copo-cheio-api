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
Playlist,
TagReferences,
Tag,
} from '../models';
import {PlaylistRepository} from '../repositories';

export class PlaylistTagController {
  constructor(
    @repository(PlaylistRepository) protected playlistRepository: PlaylistRepository,
  ) { }

  @get('/playlists/{id}/tags', {
    responses: {
      '200': {
        description: 'Array of Playlist has many Tag through TagReferences',
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
    return this.playlistRepository.tags(id).find(filter);
  }

  @post('/playlists/{id}/tags', {
    responses: {
      '200': {
        description: 'create a Tag model instance',
        content: {'application/json': {schema: getModelSchemaRef(Tag)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Playlist.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Tag, {
            title: 'NewTagInPlaylist',
            exclude: ['id'],
          }),
        },
      },
    }) tag: Omit<Tag, 'id'>,
  ): Promise<Tag> {
    return this.playlistRepository.tags(id).create(tag);
  }

  @patch('/playlists/{id}/tags', {
    responses: {
      '200': {
        description: 'Playlist.Tag PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Tag, {partial: true}),
        },
      },
    })
    tag: Partial<Tag>,
    @param.query.object('where', getWhereSchemaFor(Tag)) where?: Where<Tag>,
  ): Promise<Count> {
    return this.playlistRepository.tags(id).patch(tag, where);
  }

  @del('/playlists/{id}/tags', {
    responses: {
      '200': {
        description: 'Playlist.Tag DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Tag)) where?: Where<Tag>,
  ): Promise<Count> {
    return this.playlistRepository.tags(id).delete(where);
  }
}
