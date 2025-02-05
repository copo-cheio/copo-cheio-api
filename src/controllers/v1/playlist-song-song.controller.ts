import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {PlaylistSong, Song} from '../../models/v1';
import {PlaylistSongRepository} from '../../repositories/v1';

export class PlaylistSongSongController {
  constructor(
    @repository(PlaylistSongRepository)
    public playlistSongRepository: PlaylistSongRepository,
  ) {}

  @get('/playlist-songs/{id}/song', {
    responses: {
      '200': {
        description: 'Song belonging to PlaylistSong',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Song),
          },
        },
      },
    },
  })
  async getSong(
    @param.path.string('id') id: typeof PlaylistSong.prototype.id,
  ): Promise<Song> {
    return this.playlistSongRepository.song(id);
  }
}
