import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Price, Ticket} from '../../models/v1';
import {TicketRepository} from '../../repositories/v1';

export class TicketPriceController {
  constructor(
    @repository(TicketRepository)
    public ticketRepository: TicketRepository,
  ) {}

  @get('/tickets/{id}/price', {
    responses: {
      '200': {
        description: 'Price belonging to Ticket',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Price),
          },
        },
      },
    },
  })
  async getPrice(
    @param.path.string('id') id: typeof Ticket.prototype.id,
  ): Promise<Price> {
    return this.ticketRepository.price(id);
  }
}
