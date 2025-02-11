import {Getter, inject} from '@loopback/core';
import {HasManyRepositoryFactory, repository} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../../datasources';
import {Balcony, Menu, MenuProduct, MenuRelations} from '../../models/v1';

import {BalconyRepository} from './balcony.repository';
import {MenuProductRepository} from './menu-product.repository';

export class MenuRepository extends SoftCrudRepository<
  Menu,
  typeof Menu.prototype.id,
  MenuRelations
> {
  public readonly products: HasManyRepositoryFactory<
    MenuProduct,
    typeof Menu.prototype.id
  >;

  public readonly balconies: HasManyRepositoryFactory<
    Balcony,
    typeof Menu.prototype.id
  >;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('MenuProductRepository')
    protected menuProductRepositoryGetter: Getter<MenuProductRepository>,
    @repository.getter('BalconyRepository')
    protected balconyRepositoryGetter: Getter<BalconyRepository>,
  ) {
    super(Menu, dataSource);
    this.balconies = this.createHasManyRepositoryFactoryFor(
      'balconies',
      balconyRepositoryGetter,
    );
    this.registerInclusionResolver(
      'balconies',
      this.balconies.inclusionResolver,
    );
    this.products = this.createHasManyRepositoryFactoryFor(
      'products',
      menuProductRepositoryGetter,
    );
    this.registerInclusionResolver('products', this.products.inclusionResolver);
  }
}
