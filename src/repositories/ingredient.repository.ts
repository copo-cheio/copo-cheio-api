import {Getter,inject} from '@loopback/core';
import {BelongsToAccessor,ReferencesManyAccessor,repository} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../datasources';
import {Image,Ingredient,IngredientRelations,Tag} from '../models';
import {ImageRepository} from './image.repository';
import {TagRepository} from './tag.repository';

export class IngredientRepository extends SoftCrudRepository<
  Ingredient,
  typeof Ingredient.prototype.id,
  IngredientRelations
> {

  public readonly thumbnail: BelongsToAccessor<Image, typeof Ingredient.prototype.id>;

  public readonly tags: ReferencesManyAccessor<Tag, typeof Ingredient.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('ImageRepository') protected imageRepositoryGetter: Getter<ImageRepository>, @repository.getter('TagRepository') protected tagRepositoryGetter: Getter<TagRepository>,
  ) {
    super(Ingredient, dataSource);
    this.tags = this.createReferencesManyAccessorFor('tags', tagRepositoryGetter,);
    this.registerInclusionResolver('tags', this.tags.inclusionResolver);
    this.thumbnail = this.createBelongsToAccessorFor('thumbnail', imageRepositoryGetter,);
    this.registerInclusionResolver('thumbnail', this.thumbnail.inclusionResolver);
  }
}
