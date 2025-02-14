import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../../datasources';
import {
  Ingredient,
  Product,
  ProductIngredient,
  ProductIngredientRelations,
} from '../../models';
import {validateUuid} from '../../utils/validations';
import {IngredientRepository} from './ingredient.repository';
import {ProductRepository} from './product.repository';

export class ProductIngredientRepository extends SoftCrudRepository<
  ProductIngredient,
  typeof ProductIngredient.prototype.id,
  ProductIngredientRelations
> {
  public readonly product: BelongsToAccessor<
    Product,
    typeof ProductIngredient.prototype.id
  >;

  public readonly ingredient: BelongsToAccessor<
    Ingredient,
    typeof ProductIngredient.prototype.id
  >;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('ProductRepository')
    protected productRepositoryGetter: Getter<ProductRepository>,
    @repository.getter('IngredientRepository')
    protected ingredientRepositoryGetter: Getter<IngredientRepository>,
  ) {
    super(ProductIngredient, dataSource);
    this.ingredient = this.createBelongsToAccessorFor(
      'ingredient',
      ingredientRepositoryGetter,
    );
    this.registerInclusionResolver(
      'ingredient',
      this.ingredient.inclusionResolver,
    );
    this.product = this.createBelongsToAccessorFor(
      'product',
      productRepositoryGetter,
    );
    this.registerInclusionResolver('product', this.product.inclusionResolver);
  }

  async updateOrCreateById(id: string, payload: any = {}, options: any = {}) {
    let record: any;
    const {productId, ingredientId} = payload;

    payload = {
      productId,
      ingredientId,
    };
    if (!validateUuid(productId, '').valid)
      throw new Error('Invalid productId id', {cause: {productId, payload}});
    if (!validateUuid(ingredientId, '').valid)
      throw new Error('Invalid ingredientId id', {
        cause: {payload, ingredientId},
      });

    if (id && validateUuid(id, '').valid) {
      record = await this.updateById(id, payload, options);
      // record = await this.findById(id) ;
    } else {
      record = await this.create(payload, options);
      id = record.id;
    }

    if (!validateUuid(id, '').valid)
      throw new Error('Invalid product ingredient', {
        cause: {productOption: record},
      });

    return this.findById(id);
  }
}
