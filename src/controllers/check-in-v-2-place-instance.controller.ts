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
  PlaceInstance,
} from '../models';
import {CheckInV2Repository} from '../repositories';

export class CheckInV2PlaceInstanceController {
  constructor(
    @repository(CheckInV2Repository)
    public checkInV2Repository: CheckInV2Repository,
  ) { }

  @get('/check-in-v2s/{id}/place-instance', {
    responses: {
      '200': {
        description: 'PlaceInstance belonging to CheckInV2',
        content: {
          'application/json': {
            schema: getModelSchemaRef(PlaceInstance),
          },
        },
      },
    },
  })
  async getPlaceInstance(
    @param.path.string('id') id: typeof CheckInV2.prototype.id,
  ): Promise<PlaceInstance> {
    return this.checkInV2Repository.placeInstance(id);
  }
}
