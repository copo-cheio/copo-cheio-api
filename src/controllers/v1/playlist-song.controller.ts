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
import {Playlist, Song} from '../../models';
import {PlaylistRepository} from '../../repositories';

export class PlaylistSongController {
  constructor(
    @repository(PlaylistRepository)
    protected playlistRepository: PlaylistRepository,
  ) {}

  @get('/playlists/{id}/songs', {
    responses: {
      '200': {
        description: 'Array of Playlist has many Song through PlaylistSong',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Song)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Song>,
  ): Promise<Song[]> {
    return this.playlistRepository.songs(id).find(filter);
  }

  @post('/playlists/{id}/songs', {
    responses: {
      '200': {
        description: 'create a Song model instance',
        content: {'application/json': {schema: getModelSchemaRef(Song)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Playlist.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Song, {
            title: 'NewSongInPlaylist',
            exclude: ['id'],
          }),
        },
      },
    })
    song: Omit<Song, 'id'>,
  ): Promise<Song> {
    return this.playlistRepository.songs(id).create(song);
  }

  @patch('/playlists/{id}/songs', {
    responses: {
      '200': {
        description: 'Playlist.Song PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Song, {partial: true}),
        },
      },
    })
    song: Partial<Song>,
    @param.query.object('where', getWhereSchemaFor(Song)) where?: Where<Song>,
  ): Promise<Count> {
    return this.playlistRepository.songs(id).patch(song, where);
  }

  @del('/playlists/{id}/songs', {
    responses: {
      '200': {
        description: 'Playlist.Song DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Song)) where?: Where<Song>,
  ): Promise<Count> {
    return this.playlistRepository.songs(id).delete(where);
  }
}
