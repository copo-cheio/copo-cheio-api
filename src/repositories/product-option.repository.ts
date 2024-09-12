import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {ProductOption,ProductOptionRelations, Product, Ingredient, Price} from '../models';
import {ProductRepository} from './product.repository';
import {IngredientRepository} from './ingredient.repository';
import {PriceRepository} from './price.repository';

export class ProductOptionRepository extends DefaultCrudRepository<
  ProductOption,
  typeof ProductOption.prototype.id,
  ProductOptionRelations
> {

  public readonly product: BelongsToAccessor<Product, typeof ProductOption.prototype.id>;

  public readonly ingredient: BelongsToAccessor<Ingredient, typeof ProductOption.prototype.id>;

  public readonly price: BelongsToAccessor<Price, typeof ProductOption.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('ProductRepository') protected productRepositoryGetter: Getter<ProductRepository>, @repository.getter('IngredientRepository') protected ingredientRepositoryGetter: Getter<IngredientRepository>, @repository.getter('PriceRepository') protected priceRepositoryGetter: Getter<PriceRepository>,
  ) {
    super(ProductOption, dataSource);
    this.price = this.createBelongsToAccessorFor('price', priceRepositoryGetter,);
    this.registerInclusionResolver('price', this.price.inclusionResolver);
    this.ingredient = this.createBelongsToAccessorFor('ingredient', ingredientRepositoryGetter,);
    this.registerInclusionResolver('ingredient', this.ingredient.inclusionResolver);
    this.product = this.createBelongsToAccessorFor('product', productRepositoryGetter,);
    this.registerInclusionResolver('product', this.product.inclusionResolver);
  }
}
