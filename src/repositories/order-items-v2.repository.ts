import {Getter, inject} from '@loopback/core';
import {PostgresSqlDataSource} from '../datasources';

import {
  BelongsToAccessor,
  ReferencesManyAccessor,
  repository,
} from '@loopback/repository';
import {
  MenuProduct,
  /*   OrderItemOptionsV2, */
  OrderItemsV2,
  OrderItemsV2Relations,
  ProductOption,
} from '../models';
import {MenuProductRepository} from './v1/menu-product.repository';
/* import {OrderItemOptionsV2Repository} from './order-item-options-v2.repository'; */

import {BaseRepository} from './base.repository.base';
import {ProductOptionRepository} from './v1/product-option.repository';

export class OrderItemsV2Repository extends BaseRepository<
  OrderItemsV2,
  typeof OrderItemsV2.prototype.id,
  OrderItemsV2Relations
> {
  /*   public readonly optionsV2: HasManyRepositoryFactory<
    OrderItemOptionsV2,
    typeof OrderItemsV2.prototype.id
  >;
 */
  public readonly menuProduct: BelongsToAccessor<
    MenuProduct,
    typeof OrderItemsV2.prototype.id
  >;

  public readonly options: ReferencesManyAccessor<
    ProductOption,
    typeof OrderItemsV2.prototype.id
  >;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    /*     @repository.getter('OrderItemOptionsV2Repository')
    protected orderItemOptionsV2RepositoryGetter: Getter<OrderItemOptionsV2Repository>, */
    @repository.getter('MenuProductRepository')
    protected menuProductRepositoryGetter: Getter<MenuProductRepository>,
    @repository.getter('ProductOptionRepository')
    protected productOptionRepositoryGetter: Getter<ProductOptionRepository>,
  ) {
    super(OrderItemsV2, dataSource);
    this.options = this.createReferencesManyAccessorFor(
      'options',
      productOptionRepositoryGetter,
    );
    this.registerInclusionResolver('options', this.options.inclusionResolver);
    this.menuProduct = this.createBelongsToAccessorFor(
      'menuProduct',
      menuProductRepositoryGetter,
    );
    this.registerInclusionResolver(
      'menuProduct',
      this.menuProduct.inclusionResolver,
    );
    /*     this.optionsV2 = this.createHasManyRepositoryFactoryFor(
      'optionsV2',
      orderItemOptionsV2RepositoryGetter,
    );
    this.registerInclusionResolver(
      'optionsV2',
      this.optionsV2.inclusionResolver,
    ); */
  }
}
