import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../../datasources';

import {Balcony, Ingredient, Stock, StockRelations} from '../../models';
import {BaseRepository} from '../base.repository.base';
import {BalconyRepository} from './balcony.repository';
import {IngredientRepository} from './ingredient.repository';
import {UserRepository} from './user.repository';

export class StockRepository extends BaseRepository<
  Stock,
  typeof Stock.prototype.id,
  StockRelations
> {
  public readonly balcony: BelongsToAccessor<
    Balcony,
    typeof Stock.prototype.id
  >;

  public readonly ingredient: BelongsToAccessor<
    Ingredient,
    typeof Stock.prototype.id
  >;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('BalconyRepository')
    protected balconyRepositoryGetter: Getter<BalconyRepository>,
    @repository.getter('IngredientRepository')
    protected ingredientRepositoryGetter: Getter<IngredientRepository>,
  ) {
    super(Stock, dataSource);
    this.ingredient = this.createBelongsToAccessorFor(
      'ingredient',
      ingredientRepositoryGetter,
    );
    this.registerInclusionResolver(
      'ingredient',
      this.ingredient.inclusionResolver,
    );
    this.balcony = this.createBelongsToAccessorFor(
      'balcony',
      balconyRepositoryGetter,
    );
    this.registerInclusionResolver('balcony', this.balcony.inclusionResolver);
  }
}
