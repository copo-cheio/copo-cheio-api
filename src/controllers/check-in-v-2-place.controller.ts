import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  CheckInV2,
  Place,
} from '../models';
import {CheckInV2Repository} from '../repositories';

export class CheckInV2PlaceController {
  constructor(
    @repository(CheckInV2Repository)
    public checkInV2Repository: CheckInV2Repository,
  ) { }

  @get('/check-in-v2s/{id}/place', {
    responses: {
      '200': {
        description: 'Place belonging to CheckInV2',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Place),
          },
        },
      },
    },
  })
  async getPlace(
    @param.path.string('id') id: typeof CheckInV2.prototype.id,
  ): Promise<Place> {
    return this.checkInV2Repository.place(id);
  }
}
