import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  TimeTable,
  Playlist,
} from '../models';
import {TimeTableRepository} from '../repositories';

export class TimeTablePlaylistController {
  constructor(
    @repository(TimeTableRepository)
    public timeTableRepository: TimeTableRepository,
  ) { }

  @get('/time-tables/{id}/playlist', {
    responses: {
      '200': {
        description: 'Playlist belonging to TimeTable',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Playlist),
          },
        },
      },
    },
  })
  async getPlaylist(
    @param.path.string('id') id: typeof TimeTable.prototype.id,
  ): Promise<Playlist> {
    return this.timeTableRepository.playlist(id);
  }
}
