import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  HasManyRepositoryFactory,
  ReferencesManyAccessor,
  repository,
} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../../datasources';
import {
  Image,
  Product,
  ProductIngredient,
  ProductOption,
  ProductRelations,
  Tag,
} from '../../models';
import {ImageRepository} from './image.repository';
import {IngredientRepository} from './ingredient.repository';
import {ProductIngredientRepository} from './product-ingredient.repository';
import {ProductOptionRepository} from './product-option.repository';
import {TagRepository} from './tag.repository';

export class ProductRepository extends SoftCrudRepository<
  Product,
  typeof Product.prototype.name,
  ProductRelations
> {
  public readonly tags: ReferencesManyAccessor<
    Tag,
    typeof Product.prototype.name
  >;

  public readonly thumbnail: BelongsToAccessor<
    Image,
    typeof Product.prototype.name
  >;

  public readonly ingredients: HasManyRepositoryFactory<
    ProductIngredient,
    typeof Product.prototype.name
  >;

  public readonly options: HasManyRepositoryFactory<
    ProductOption,
    typeof Product.prototype.name
  >;
  // public readonly ingredients: HasManyThroughRepositoryFactory<
  //   Ingredient,
  //   typeof Ingredient.prototype.id,
  //   ProductIngredient,
  //   typeof Product.prototype.name
  // >;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('TagRepository')
    protected tagRepositoryGetter: Getter<TagRepository>,
    @repository.getter('ImageRepository')
    protected imageRepositoryGetter: Getter<ImageRepository>,
    @repository.getter('ProductIngredientRepository')
    protected productIngredientRepositoryGetter: Getter<ProductIngredientRepository>,
    @repository.getter('IngredientRepository')
    protected ingredientRepositoryGetter: Getter<IngredientRepository>,
    @repository.getter('ProductOptionRepository')
    protected productOptionRepositoryGetter: Getter<ProductOptionRepository>,
  ) {
    super(Product, dataSource);
    this.options = this.createHasManyRepositoryFactoryFor(
      'options',
      productOptionRepositoryGetter,
    );
    this.registerInclusionResolver('options', this.options.inclusionResolver);
    this.ingredients = this.createHasManyRepositoryFactoryFor(
      'ingredients',
      productIngredientRepositoryGetter,
    );
    this.registerInclusionResolver(
      'ingredients',
      this.ingredients.inclusionResolver,
    );
    // this.ingredients = this.createHasManyThroughRepositoryFactoryFor(
    //   "ingredients",
    //   ingredientRepositoryGetter,
    //   productIngredientRepositoryGetter
    // );
    // this.registerInclusionResolver(
    //   "ingredients",
    //   this.ingredients.inclusionResolver
    // );
    this.thumbnail = this.createBelongsToAccessorFor(
      'thumbnail',
      imageRepositoryGetter,
    );
    this.registerInclusionResolver(
      'thumbnail',
      this.thumbnail.inclusionResolver,
    );
    this.tags = this.createReferencesManyAccessorFor(
      'tags',
      tagRepositoryGetter,
    );
    this.registerInclusionResolver('tags', this.tags.inclusionResolver);
  }
}
