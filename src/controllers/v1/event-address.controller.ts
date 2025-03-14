import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Address, Event} from '../../models';
import {EventRepository} from '../../repositories';

export class EventAddressController {
  constructor(
    @repository(EventRepository)
    public eventRepository: EventRepository,
  ) {}

  @get('/events/{id}/address', {
    responses: {
      '200': {
        description: 'Address belonging to Event',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Address),
          },
        },
      },
    },
  })
  async getAddress(
    @param.path.string('id') id: typeof Event.prototype.id,
  ): Promise<Address> {
    return this.eventRepository.address(id);
  }
}
