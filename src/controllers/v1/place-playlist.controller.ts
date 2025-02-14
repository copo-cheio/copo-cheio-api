import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param, post, requestBody} from '@loopback/rest';
import {Place, Playlist} from '../../models';
import {PlaceRepository, PlaylistRepository} from '../../repositories';

export class PlacePlaylistController {
  constructor(
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,
    @repository(PlaylistRepository)
    public playlistRepository: PlaylistRepository,
  ) {}

  @get('/places/{id}/playlist', {
    responses: {
      '200': {
        description: 'Playlist belonging to Place',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Playlist),
          },
        },
      },
    },
  })
  async getPlaylist(
    @param.path.string('id') id: typeof Place.prototype.id,
  ): Promise<Playlist> {
    return this.placeRepository.playlist(id);
  }

  @post('/places/{id}/playlists', {
    responses: {
      '200': {
        description: 'create a Playlist model instance',
        content: {'application/json': {schema: getModelSchemaRef(Playlist)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Place.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Playlist, {
            title: 'NewPlaylistInPlace',
            exclude: ['id'],
          }),
        },
      },
    })
    playlist: Omit<Playlist, 'id'>,
  ): Promise<Playlist> {
    // let playlist = await  this.placeRepository.playlist(id);
    const record = await this.playlistRepository.create(playlist);
    await this.placeRepository.updateById(id, {playlistId: record.id});

    return record;
  }

  /*
  @patch('/places/{id}/playlists', {
    responses: {
      '200': {
        description: 'Place.Playlist PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })

  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Playlist, {partial: true}),
        },
      },
    })
    playlist: Partial<Playlist>,
    @param.query.object('where', getWhereSchemaFor(Playlist)) where?: Where<Playlist>,
  ): Promise<Count> {
    // return this.placeRepository.playlist(id).patch(playlist, where);
  }

  @del('/places/{id}/playlists', {
    responses: {
      '200': {
        description: 'Place.Playlist DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Playlist)) where?: Where<Playlist>,
  ): Promise<Count> {
    return this.placeRepository.playlist(id).delete(where);
  }
  */
}
