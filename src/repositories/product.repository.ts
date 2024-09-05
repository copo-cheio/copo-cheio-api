import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, ReferencesManyAccessor, BelongsToAccessor, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {Product,ProductRelations, Tag, Image, Ingredient, ProductIngredient} from '../models';
import {TagRepository} from './tag.repository';
import {ImageRepository} from './image.repository';
import {ProductIngredientRepository} from './product-ingredient.repository';
import {IngredientRepository} from './ingredient.repository';

export class ProductRepository extends DefaultCrudRepository<
  Product,
  typeof Product.prototype.name,
  ProductRelations
> {

  public readonly tags: ReferencesManyAccessor<Tag, typeof Product.prototype.name>;

  public readonly thumbnail: BelongsToAccessor<Image, typeof Product.prototype.name>;

  public readonly ingredients: HasManyThroughRepositoryFactory<Ingredient, typeof Ingredient.prototype.id,
          ProductIngredient,
          typeof Product.prototype.name
        >;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('TagRepository') protected tagRepositoryGetter: Getter<TagRepository>, @repository.getter('ImageRepository') protected imageRepositoryGetter: Getter<ImageRepository>, @repository.getter('ProductIngredientRepository') protected productIngredientRepositoryGetter: Getter<ProductIngredientRepository>, @repository.getter('IngredientRepository') protected ingredientRepositoryGetter: Getter<IngredientRepository>,
  ) {
    super(Product, dataSource);
    this.ingredients = this.createHasManyThroughRepositoryFactoryFor('ingredients', ingredientRepositoryGetter, productIngredientRepositoryGetter,);
    this.registerInclusionResolver('ingredients', this.ingredients.inclusionResolver);
    this.thumbnail = this.createBelongsToAccessorFor('thumbnail', imageRepositoryGetter,);
    this.registerInclusionResolver('thumbnail', this.thumbnail.inclusionResolver);
    this.tags = this.createReferencesManyAccessorFor('tags', tagRepositoryGetter,);
    this.registerInclusionResolver('tags', this.tags.inclusionResolver);
  }
}
