import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../../datasources';
import {Balcony, Menu, MenuProduct, MenuRelations} from '../../models';

import {Company} from '../../models';
import {BalconyRepository} from './balcony.repository';
import {CompanyRepository} from './company.repository';
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

  public readonly company: BelongsToAccessor<Company, typeof Menu.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('MenuProductRepository')
    protected menuProductRepositoryGetter: Getter<MenuProductRepository>,
    @repository.getter('BalconyRepository')
    protected balconyRepositoryGetter: Getter<BalconyRepository>,
    @repository.getter('CompanyRepository')
    protected companyRepositoryGetter: Getter<CompanyRepository>,
  ) {
    super(Menu, dataSource);
    this.company = this.createBelongsToAccessorFor(
      'company',
      companyRepositoryGetter,
    );
    this.registerInclusionResolver('company', this.company.inclusionResolver);
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
