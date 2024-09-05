import { Getter, inject } from '@loopback/core';
import { BelongsToAccessor, DefaultCrudRepository, repository } from '@loopback/repository';
import { PostgresSqlDataSource } from '../datasources';
import { Ingredient, Product, ProductIngredient, ProductIngredientRelations } from '../models';
import { IngredientRepository } from './ingredient.repository';
import { ProductRepository } from './product.repository';

export class ProductIngredientRepository extends DefaultCrudRepository<
  ProductIngredient,
  typeof ProductIngredient.prototype.id,
  ProductIngredientRelations
> {

  public readonly product: BelongsToAccessor<Product, typeof ProductIngredient.prototype.id>;

  public readonly ingredient: BelongsToAccessor<Ingredient, typeof ProductIngredient.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('ProductRepository') protected productRepositoryGetter: Getter<ProductRepository>, @repository.getter('IngredientRepository') protected ingredientRepositoryGetter: Getter<IngredientRepository>,
  ) {
    super(ProductIngredient, dataSource);
    this.ingredient = this.createBelongsToAccessorFor('ingredient', ingredientRepositoryGetter,);
    this.registerInclusionResolver('ingredient', this.ingredient.inclusionResolver);
    this.product = this.createBelongsToAccessorFor('product', productRepositoryGetter,);
    this.registerInclusionResolver('product', this.product.inclusionResolver);
  }
}
