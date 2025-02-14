import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Place, Schedule} from '../../models';
import {PlaceRepository} from '../../repositories';

export class PlaceScheduleController {
  constructor(
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,
  ) {}

  @get('/places/{id}/schedule', {
    responses: {
      '200': {
        description: 'Schedule belonging to Place',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Schedule),
          },
        },
      },
    },
  })
  async getSchedule(
    @param.path.string('id') id: typeof Place.prototype.id,
  ): Promise<Schedule> {
    return this.placeRepository.schedule(id);
  }
}
