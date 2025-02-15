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
  Balcony,
} from '../models';
import {CheckInV2Repository} from '../repositories';

export class CheckInV2BalconyController {
  constructor(
    @repository(CheckInV2Repository)
    public checkInV2Repository: CheckInV2Repository,
  ) { }

  @get('/check-in-v2s/{id}/balcony', {
    responses: {
      '200': {
        description: 'Balcony belonging to CheckInV2',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Balcony),
          },
        },
      },
    },
  })
  async getBalcony(
    @param.path.string('id') id: typeof CheckInV2.prototype.id,
  ): Promise<Balcony> {
    return this.checkInV2Repository.balcony(id);
  }
}
