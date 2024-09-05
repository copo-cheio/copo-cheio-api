import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, ReferencesManyAccessor} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {Product,ProductRelations, Tag} from '../models';
import {TagRepository} from './tag.repository';

export class ProductRepository extends DefaultCrudRepository<
  Product,
  typeof Product.prototype.name,
  ProductRelations
> {

  public readonly tags: ReferencesManyAccessor<Tag, typeof Product.prototype.name>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('TagRepository') protected tagRepositoryGetter: Getter<TagRepository>,
  ) {
    super(Product, dataSource);
    this.tags = this.createReferencesManyAccessorFor('tags', tagRepositoryGetter,);
    this.registerInclusionResolver('tags', this.tags.inclusionResolver);
  }
}
