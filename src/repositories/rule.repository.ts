import {Getter,inject} from '@loopback/core';
import {BelongsToAccessor,DefaultCrudRepository,repository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {Rule,RuleRelations,Translation} from '../models';
import {TranslationRepository} from './translation.repository';

export class RuleRepository extends DefaultCrudRepository<
  Rule,
  typeof Rule.prototype.id,
  RuleRelations
> {

  public readonly translation: BelongsToAccessor<Translation, typeof Rule.prototype.id>;

  public readonly valueTranslation: BelongsToAccessor<Translation, typeof Rule.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('TranslationRepository') protected translationRepositoryGetter: Getter<TranslationRepository>,
  ) {
    super(Rule, dataSource);
    this.valueTranslation = this.createBelongsToAccessorFor('valueTranslation', translationRepositoryGetter,);
    this.registerInclusionResolver('valueTranslation', this.valueTranslation.inclusionResolver);
    this.translation = this.createBelongsToAccessorFor('translation', translationRepositoryGetter,);
    this.registerInclusionResolver('translation', this.translation.inclusionResolver);
  }
}
