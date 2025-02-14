import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../../datasources';
import {Tag, TagRelations, Translation} from '../../models';
// import {TagReferencesRepository} from "./tag-references.repository";
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {TranslationRepository} from './translation.repository';

export class TagRepository extends SoftCrudRepository<
  Tag,
  typeof Tag.prototype.id,
  TagRelations
> {
  public readonly translation: BelongsToAccessor<
    Translation,
    typeof Tag.prototype.id
  >;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('TranslationRepository')
    protected translationRepositoryGetter: Getter<TranslationRepository>,
    // @repository.getter("TagReferencesRepository")
    // protected tagReferencesRepositoryGetter: Getter<TagReferencesRepository>,
  ) {
    //  @repository.getter('ArtistRepository') protected artistRepositoryGetter: Getter<ArtistRepository>,
    super(Tag, dataSource);

    this.translation = this.createBelongsToAccessorFor(
      'translation',
      translationRepositoryGetter,
    );
    this.registerInclusionResolver(
      'translation',
      this.translation.inclusionResolver,
    );
  }
}
