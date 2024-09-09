import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {Menu,MenuRelations, MenuProduct} from '../models';
import {MenuProductRepository} from './menu-product.repository';

export class MenuRepository extends DefaultCrudRepository<
  Menu,
  typeof Menu.prototype.id,
  MenuRelations
> {

  public readonly products: HasManyRepositoryFactory<MenuProduct, typeof Menu.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('MenuProductRepository') protected menuProductRepositoryGetter: Getter<MenuProductRepository>,
  ) {
    super(Menu, dataSource);
    this.products = this.createHasManyRepositoryFactoryFor('products', menuProductRepositoryGetter,);
    this.registerInclusionResolver('products', this.products.inclusionResolver);
  }
}
