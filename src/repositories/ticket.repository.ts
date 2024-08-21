import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {SqliteDbDataSource} from '../datasources';
import {Ticket, TicketRelations, Price} from '../models';
import {PriceRepository} from './price.repository';

export class TicketRepository extends DefaultCrudRepository<
  Ticket,
  typeof Ticket.prototype.id,
  TicketRelations
> {

  public readonly price: BelongsToAccessor<Price, typeof Ticket.prototype.id>;

  constructor(
    @inject('datasources.SqliteDb') dataSource: SqliteDbDataSource, @repository.getter('PriceRepository') protected priceRepositoryGetter: Getter<PriceRepository>,
  ) {
    super(Ticket, dataSource);
    this.price = this.createBelongsToAccessorFor('price', priceRepositoryGetter,);
    this.registerInclusionResolver('price', this.price.inclusionResolver);
  }
}
