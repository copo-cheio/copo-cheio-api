import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  ReferencesManyAccessor,
  repository,
} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../../datasources';
import {
  MenuProduct,
  OrderItem,
  OrderItemRelations,
  ProductOption,
} from '../../models';
import {MenuProductRepository} from './menu-product.repository';
import {ProductOptionRepository} from './product-option.repository';

export class OrderItemRepository extends SoftCrudRepository<
  OrderItem,
  typeof OrderItem.prototype.id,
  OrderItemRelations
> {
  public readonly menuProduct: BelongsToAccessor<
    MenuProduct,
    typeof OrderItem.prototype.id
  >;

  public readonly productOptions: ReferencesManyAccessor<
    ProductOption,
    typeof OrderItem.prototype.id
  >;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('MenuProductRepository')
    protected menuProductRepositoryGetter: Getter<MenuProductRepository>,
    @repository.getter('ProductOptionRepository')
    protected productOptionRepositoryGetter: Getter<ProductOptionRepository>,
  ) {
    super(OrderItem, dataSource);
    this.productOptions = this.createReferencesManyAccessorFor(
      'productOptions',
      productOptionRepositoryGetter,
    );
    this.registerInclusionResolver(
      'productOptions',
      this.productOptions.inclusionResolver,
    );
    this.menuProduct = this.createBelongsToAccessorFor(
      'menuProduct',
      menuProductRepositoryGetter,
    );
    this.registerInclusionResolver(
      'menuProduct',
      this.menuProduct.inclusionResolver,
    );
  }
}
