import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {LineUpArtist, Schedule} from '../../models';
import {LineUpArtistRepository} from '../../repositories';

export class LineUpArtistScheduleController {
  constructor(
    @repository(LineUpArtistRepository)
    public lineUpArtistRepository: LineUpArtistRepository,
  ) {}

  @get('/line-up-artists/{id}/schedule', {
    responses: {
      '200': {
        description: 'Schedule belonging to LineUpArtist',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Schedule),
          },
        },
      },
    },
  })
  async getSchedule(
    @param.path.string('id') id: typeof LineUpArtist.prototype.id,
  ): Promise<Schedule> {
    return this.lineUpArtistRepository.schedule(id);
  }
}
