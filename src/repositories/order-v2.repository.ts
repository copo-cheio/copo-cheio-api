import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';

import {PostgresSqlDataSource} from '../datasources';
import {Balcony, OrderV2, OrderV2Relations} from '../models';
import {BalconyRepository, BaseRepository} from './v1';
export class OrderV2Repository extends BaseRepository<
  OrderV2,
  typeof OrderV2.prototype.id,
  OrderV2Relations
> {
  public readonly balcony: BelongsToAccessor<
    Balcony,
    typeof OrderV2.prototype.id
  >;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('BalconyRepository')
    protected balconyRepositoryGetter: Getter<BalconyRepository>,
  ) {
    super(OrderV2, dataSource);
    this.balcony = this.createBelongsToAccessorFor(
      'balcony',
      balconyRepositoryGetter,
    );
    this.registerInclusionResolver('balcony', this.balcony.inclusionResolver);
  }
}
