import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';

// import {TagReferencesRepository} from "./tag-references.repository";
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../../datasources';
import {Translation} from '../../models';
import {Tag, TagRelations} from '../../models/v1/tag.model';
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

  async getDistinctTagTypes() {
    return this.dataSource.execute('SELECT DISTINCT type FROM Tag');
  }
}
