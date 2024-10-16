import {Getter,inject} from '@loopback/core';
import {HasManyRepositoryFactory,repository} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../datasources';
import {Menu,MenuProduct,MenuRelations} from '../models';
import {MenuProductRepository} from './menu-product.repository';

export class MenuRepository extends SoftCrudRepository<
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
