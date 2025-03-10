import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../../datasources';
import {
  Image,
  Menu,
  MenuProduct,
  MenuProductRelations,
  Price,
  Product,
} from '../../models';
import {ImageRepository} from './image.repository';

import {MenuRepository} from './menu.repository';
import {PriceRepository} from './price.repository';
import {ProductRepository} from './product.repository';

export class MenuProductRepository extends SoftCrudRepository<
  MenuProduct,
  typeof MenuProduct.prototype.id,
  MenuProductRelations
> {
  public readonly price: BelongsToAccessor<
    Price,
    typeof MenuProduct.prototype.id
  >;

  public readonly product: BelongsToAccessor<
    Product,
    typeof MenuProduct.prototype.id
  >;

  public readonly menu: BelongsToAccessor<
    Menu,
    typeof MenuProduct.prototype.id
  >;

  public readonly thumbnail: BelongsToAccessor<
    Image,
    typeof MenuProduct.prototype.id
  >;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('PriceRepository')
    protected priceRepositoryGetter: Getter<PriceRepository>,
    @repository.getter('ProductRepository')
    protected productRepositoryGetter: Getter<ProductRepository>,
    @repository.getter('MenuRepository')
    protected menuRepositoryGetter: Getter<MenuRepository>,
    @repository.getter('ImageRepository')
    protected imageRepositoryGetter: Getter<ImageRepository>,
  ) {
    super(MenuProduct, dataSource);
    this.thumbnail = this.createBelongsToAccessorFor(
      'thumbnail',
      imageRepositoryGetter,
    );
    this.registerInclusionResolver(
      'thumbnail',
      this.thumbnail.inclusionResolver,
    );
    this.menu = this.createBelongsToAccessorFor('menu', menuRepositoryGetter);
    this.registerInclusionResolver('menu', this.menu.inclusionResolver);
    this.product = this.createBelongsToAccessorFor(
      'product',
      productRepositoryGetter,
    );
    this.registerInclusionResolver('product', this.product.inclusionResolver);
    this.price = this.createBelongsToAccessorFor(
      'price',
      priceRepositoryGetter,
    );
    this.registerInclusionResolver('price', this.price.inclusionResolver);
  }
}
