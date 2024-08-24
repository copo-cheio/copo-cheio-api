import {Getter,inject} from '@loopback/core';
import {BelongsToAccessor,DefaultCrudRepository,repository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {Price,Ticket,TicketRelations} from '../models';
import {PriceRepository} from './price.repository';

export class TicketRepository extends DefaultCrudRepository<
  Ticket,
  typeof Ticket.prototype.id,
  TicketRelations
> {

  public readonly price: BelongsToAccessor<Price, typeof Ticket.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('PriceRepository') protected priceRepositoryGetter: Getter<PriceRepository>,
  ) {
    super(Ticket, dataSource);
    this.price = this.createBelongsToAccessorFor('price', priceRepositoryGetter,);
    this.registerInclusionResolver('price', this.price.inclusionResolver);
  }
}
