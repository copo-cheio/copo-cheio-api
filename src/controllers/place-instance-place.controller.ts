import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Place, PlaceInstance} from '../models';
import {PlaceInstanceRepository} from '../repositories/v1/place-instance.repository';

export class PlaceInstancePlaceController {
  constructor(
    @repository(PlaceInstanceRepository)
    public placeInstanceRepository: PlaceInstanceRepository,
  ) {}

  @get('/place-instances/{id}/place', {
    responses: {
      '200': {
        description: 'Place belonging to PlaceInstance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Place),
          },
        },
      },
    },
  })
  async getPlace(
    @param.path.string('id') id: typeof PlaceInstance.prototype.id,
  ): Promise<Place> {
    return this.placeInstanceRepository.place(id);
  }
}
