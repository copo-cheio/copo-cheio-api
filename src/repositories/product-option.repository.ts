import {Getter,inject} from "@loopback/core";
import {BelongsToAccessor,repository} from "@loopback/repository";
import {SoftCrudRepository} from "loopback4-soft-delete";
import {PostgresSqlDataSource} from "../datasources";
import {
  Ingredient,
  Price,
  Product,
  ProductOption,
  ProductOptionRelations,
} from "../models";
import {validateUuid} from "../utils/validations";
import {IngredientRepository} from "./ingredient.repository";
import {PriceRepository} from "./price.repository";
import {ProductRepository} from "./product.repository";

export class ProductOptionRepository extends SoftCrudRepository<
  ProductOption,
  typeof ProductOption.prototype.id,
  ProductOptionRelations
> {
  public readonly product: BelongsToAccessor<
    Product,
    typeof ProductOption.prototype.id
  >;

  public readonly ingredient: BelongsToAccessor<
    Ingredient,
    typeof ProductOption.prototype.id
  >;

  public readonly price: BelongsToAccessor<
    Price,
    typeof ProductOption.prototype.id
  >;

  constructor(
    @inject("datasources.PostgresSql") dataSource: PostgresSqlDataSource,
    @repository.getter("ProductRepository")
    protected productRepositoryGetter: Getter<ProductRepository>,
    @repository.getter("IngredientRepository")
    protected ingredientRepositoryGetter: Getter<IngredientRepository>,
    @repository.getter("PriceRepository")
    protected priceRepositoryGetter: Getter<PriceRepository>
  ) {
    super(ProductOption, dataSource);
    this.price = this.createBelongsToAccessorFor(
      "price",
      priceRepositoryGetter
    );
    this.registerInclusionResolver("price", this.price.inclusionResolver);
    this.ingredient = this.createBelongsToAccessorFor(
      "ingredient",
      ingredientRepositoryGetter
    );
    this.registerInclusionResolver(
      "ingredient",
      this.ingredient.inclusionResolver
    );
    this.product = this.createBelongsToAccessorFor(
      "product",
      productRepositoryGetter
    );
    this.registerInclusionResolver("product", this.product.inclusionResolver);
  }

  async updateOrCreateById(id: string, payload: any = {}, options: any = {}) {
    let record: any;
    const { priceId, productId, ingredientId, group } = payload;
    payload = {
      priceId,
      productId,
      ingredientId,
      includedByDefault: payload.includedByDefault || false,
      group,
    };
    if (!validateUuid(priceId, "").valid)
      throw new Error("Invalid price id", { cause: { payload } });
    if (!validateUuid(ingredientId, "").valid)
      throw new Error("Invalid ingredientId id", {
        cause: { payload:JSON.stringify(payload),v:JSON.stringify(validateUuid(ingredientId, "")), ingredientId },
      });
    if (typeof group != "string" || group == "")
      throw new Error("Invalid option group", {
        cause: { payload, group },
      });

    if (id && validateUuid(id, "").valid) {
      record = await this.updateById(id, payload, options);
      // record = await this.findById(id) ;
    } else {
      record = await this.create(payload, options);
      id = record.id;
    }

    if (!validateUuid(id, "").valid)
      throw new Error("Invalid product option", {
        cause: { productOption: record },
      });

    return await this.findById(id);
  }
}
