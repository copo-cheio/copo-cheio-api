import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {EventInstance, PlaceInstance} from '../models';
import {PlaceInstanceRepository} from '../repositories/v1/place-instance.repository';

export class PlaceInstanceEventInstanceController {
  constructor(
    @repository(PlaceInstanceRepository)
    public placeInstanceRepository: PlaceInstanceRepository,
  ) {}

  @get('/place-instances/{id}/event-instance', {
    responses: {
      '200': {
        description: 'EventInstance belonging to PlaceInstance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(EventInstance),
          },
        },
      },
    },
  })
  async getEventInstance(
    @param.path.string('id') id: typeof PlaceInstance.prototype.id,
  ): Promise<EventInstance> {
    return this.placeInstanceRepository.eventInstance(id);
  }
}
