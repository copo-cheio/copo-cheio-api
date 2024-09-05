import {Getter,inject} from '@loopback/core';
import {BelongsToAccessor,DefaultCrudRepository,repository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {Image,Ingredient,IngredientRelations} from '../models';
import {ImageRepository} from './image.repository';

export class IngredientRepository extends DefaultCrudRepository<
  Ingredient,
  typeof Ingredient.prototype.id,
  IngredientRelations
> {

  public readonly thumbnail: BelongsToAccessor<Image, typeof Ingredient.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('ImageRepository') protected imageRepositoryGetter: Getter<ImageRepository>,
  ) {
    super(Ingredient, dataSource);
    this.thumbnail = this.createBelongsToAccessorFor('thumbnail', imageRepositoryGetter,);
    this.registerInclusionResolver('thumbnail', this.thumbnail.inclusionResolver);
  }
}
