import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../../datasources';
import {Price, Ticket, TicketRelations} from '../../models/v1';
import {PriceRepository} from './price.repository';

export class TicketRepository extends SoftCrudRepository<
  Ticket,
  typeof Ticket.prototype.id,
  TicketRelations
> {
  public readonly price: BelongsToAccessor<Price, typeof Ticket.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('PriceRepository')
    protected priceRepositoryGetter: Getter<PriceRepository>,
  ) {
    super(Ticket, dataSource);
    this.price = this.createBelongsToAccessorFor(
      'price',
      priceRepositoryGetter,
    );
    this.registerInclusionResolver('price', this.price.inclusionResolver);
  }
}
