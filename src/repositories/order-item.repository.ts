import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, ReferencesManyAccessor} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {OrderItem,OrderItemRelations, MenuProduct, ProductOption} from '../models';
import {MenuProductRepository} from './menu-product.repository';
import {ProductOptionRepository} from './product-option.repository';

export class OrderItemRepository extends DefaultCrudRepository<
  OrderItem,
  typeof OrderItem.prototype.id,
  OrderItemRelations
> {

  public readonly menuProduct: BelongsToAccessor<MenuProduct, typeof OrderItem.prototype.id>;

  public readonly productOptions: ReferencesManyAccessor<ProductOption, typeof OrderItem.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('MenuProductRepository') protected menuProductRepositoryGetter: Getter<MenuProductRepository>, @repository.getter('ProductOptionRepository') protected productOptionRepositoryGetter: Getter<ProductOptionRepository>,
  ) {
    super(OrderItem, dataSource);
    this.productOptions = this.createReferencesManyAccessorFor('productOptions', productOptionRepositoryGetter,);
    this.registerInclusionResolver('productOptions', this.productOptions.inclusionResolver);
    this.menuProduct = this.createBelongsToAccessorFor('menuProduct', menuProductRepositoryGetter,);
    this.registerInclusionResolver('menuProduct', this.menuProduct.inclusionResolver);
  }
}
