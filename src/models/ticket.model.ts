import {belongsTo,model,property} from '@loopback/repository';
import {Base} from './base.model';
import {Price} from './price.model';

@model()
export class Ticket extends Base {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  description?: string;
  @property({
    type: 'number',
  })
  status?: number;

  @belongsTo(() => Price)
  priceId: string;

  @property({
    type: 'string',
  })
  refId?: string;

  constructor(data?: Partial<Ticket>) {
    super(data);
  }
}

export interface TicketRelations {
  // describe navigational properties here
}

export type TicketWithRelations = Ticket & TicketRelations;
