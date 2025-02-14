import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Playlist, PlaylistSong} from '../../models';
import {PlaylistSongRepository} from '../../repositories';

export class PlaylistSongPlaylistController {
  constructor(
    @repository(PlaylistSongRepository)
    public playlistSongRepository: PlaylistSongRepository,
  ) {}

  @get('/playlist-songs/{id}/playlist', {
    responses: {
      '200': {
        description: 'Playlist belonging to PlaylistSong',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Playlist),
          },
        },
      },
    },
  })
  async getPlaylist(
    @param.path.string('id') id: typeof PlaylistSong.prototype.id,
  ): Promise<Playlist> {
    return this.playlistSongRepository.playlist(id);
  }
}
