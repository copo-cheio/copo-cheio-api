import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Ticket,
  Price,
} from '../models';
import {TicketRepository} from '../repositories';

export class TicketPriceController {
  constructor(
    @repository(TicketRepository)
    public ticketRepository: TicketRepository,
  ) { }

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
