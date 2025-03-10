import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {DEFAULT_MODEL_ID} from '../constants';
import {Product} from '../models';
import {
  IngredientRepository,
  PriceRepository,
  ProductIngredientRepository,
  ProductOptionRepository,
  ProductRepository,
} from '../repositories';
import {transactionWrapper} from '../shared/database';
import {validateUuid} from '../utils/validations';

interface iCreateProduct {
  name: string;
  description: string;
  thumbnailId?: string;
  options?: any[];
  ingredients?: any[];
  tagIds: any[];
}

@injectable({scope: BindingScope.TRANSIENT})
export class ProductService {
  constructor(
    @repository('ProductRepository')
    public productRepository: ProductRepository,
    @repository('ProductOptionRepository')
    public productOptionRepository: ProductOptionRepository,
    @repository('ProductIngredientRepository')
    public productIngredientRepository: ProductIngredientRepository,
    @repository('IngredientRepository')
    public ingredientRepository: IngredientRepository,
    @repository('PriceRepository')
    public priceRepository: PriceRepository,
  ) {}

  /**
   *
   * @param payload
   * @returns
   */

  async handleProductPayload(
    payload: any = {},
    transaction: any,
    callbackFn: any,
  ) {
    const productPayload: any = {
      name: payload.name,
      live: payload.live,
      description: payload.description,
      thumbnailId: payload.thumbnailId || DEFAULT_MODEL_ID.thumbnailId,
      tagIds: payload.tagIds || [],
    };

    let productId: any = payload.id;
    let product: any;
    if (productId) {
      product = await this.productRepository.updateById(
        productId,
        productPayload,
      );
      product = await this.productRepository.findById(productId);
    } else {
      product = await this.productRepository.create(productPayload);
    }
    //    const product: any = await callbackFn(productPayload);

    productId = product.id;

    const checkProductId = validateUuid(productId, '');
    if (!checkProductId.valid) {
      throw new Error('Invalid product id', {
        cause: {product, checkProductId},
      });
    }

    return {productId, product};
  }

  async handleProductOptions(
    productId: string,
    payload: any = {},
    transaction: any,
  ) {
    const productOptionIds: any[] = [];
    let optionsPayload: any = payload.options || [];
    if (optionsPayload.length > 0) {
      if (!optionsPayload[0]?.ingredientId) {
        const newOptionsPayload: any = [];
        for (const op of optionsPayload) {
          let record: any = await this.productOptionRepository.findOne({
            where: {
              and: [{productId}, {ingredientId: op.id}, {deleted: false}],
            },
            include: [{relation: 'price'}],
          });
          if (!record) {
            const price = await this.priceRepository.updateOrCreateById(
              undefined,
              {},
              transaction,
            );

            const ingredient: any = await this.ingredientRepository.findById(
              op.id,
              {include: [{relation: 'tags'}]},
            );
            const group = (ingredient?.tags || []).find(
              (tag: any) => tag.type == 'ingredient-category',
            )?.name;

            record = await this.productOptionRepository.create({
              productId,
              ingredientId: ingredient.id,
              group,
              priceId: price.id,
            });
            record = await this.productOptionRepository.findOne({
              where: {
                and: [{productId}, {ingredientId: op.id}, {deleted: false}],
              },
              include: [{relation: 'price'}],
            });
            /* option.ingredientId = ingredient.id;
            option.group = group;
            ingredientId = ingredient.id; */
          }
          newOptionsPayload.push(record);
        }
        optionsPayload = [...newOptionsPayload];
      }
    }

    for (const option of optionsPayload) {
      const price = await this.priceRepository.updateOrCreateById(
        option?.price?.id,
        option?.price || {},
        transaction,
      );
      const priceId = price.id;
      const ingredientId = option.ingredientId;
      const group = option.group;

      let productOption: any = await this.productOptionRepository.findOne({
        where: {and: [{productId}, {ingredientId}, {deleted: false}]},
      });
      if (productOption) {
        await this.productOptionRepository.updateOrCreateById(
          productOption.id,
          {
            productId,
            priceId,
            ingredientId,
            includedByDefault: option.includedByDefault || false,
            group,
          },
          transaction,
        );
      } else {
        productOption = await this.productOptionRepository.create(
          {
            productId,
            priceId,
            ingredientId,
            includedByDefault: option.includedByDefault || false,
            group,
          },
          transaction,
        );
      }

      productOptionIds.push(productOption.id);
    }

    return {productOptionIds};
  }
  async handleProductIngredients(
    productId: string,
    payload: any = {},
    transaction: any,
  ) {
    const productIngredientIds: any = [];
    const productIngredients: any = payload.ingredients || [];
    for (const productIngredient of productIngredients) {
      let record;
      if (productIngredient.ingredientId) {
        record = await this.productIngredientRepository.updateOrCreateById(
          productIngredient.id,
          {productId, ingredientId: productIngredient.ingredientId},
          transaction,
        );
      } else {
        record = await this.productIngredientRepository.findOne({
          where: {
            and: [
              {productId},
              {deleted: false},
              {ingredientId: productIngredient.id},
            ],
          },
        });
        if (!record) {
          record = await this.productIngredientRepository.create(
            {productId, ingredientId: productIngredient.id},
            transaction,
          );
        }
      }

      productIngredientIds.push(record.id);
    }

    return {productIngredientIds};
  }

  async create(payload: iCreateProduct): Promise<Product> {
    return transactionWrapper(
      this.productRepository,
      async (transaction: any) => {
        if (!payload?.ingredients?.length) {
          throw new Error('A product requires at least one ingredient');
        }
        if (!payload?.tagIds?.length) {
          throw new Error('A product requires at least one tag');
        }
        const {product, productId} = await this.handleProductPayload(
          payload,
          transaction,
          this.productRepository.create,
        );

        const {productOptionIds} = await this.handleProductOptions(
          productId,
          payload,
          transaction,
        );

        const {productIngredientIds} = await this.handleProductIngredients(
          productId,
          payload,
          transaction,
        );

        return this.productRepository.findById(product.id);
      },
    );
  }

  async updateProduct(
    id: string,

    payload: any,
  ): Promise<Product> {
    return transactionWrapper(
      this.productRepository,
      async (transaction: any) => {
        // Create the product

        if (!payload?.ingredients?.length) {
          throw new Error('A product requires at least one ingredient');
        }
        if (!payload?.tagIds?.length) {
          throw new Error('A product requires at least one tag');
        }
        payload.id = id;
        const {product, productId} = await this.handleProductPayload(
          payload,
          transaction,
          async (_payload: any, _transaction: any) => {
            // console.log(id,_payload)
            const up = await this.productRepository.updateById(
              id,
              _payload,
              _transaction,
            );
            // console.log({id,up})

            const record = await this.productRepository.findById(id);
            // console.log({id,up,record})
            return record;
          },
        );

        const {productOptionIds} = await this.handleProductOptions(
          productId,
          payload,
          transaction,
        );

        const {productIngredientIds} = await this.handleProductIngredients(
          productId,
          payload,
          transaction,
        );

        await this.productIngredientRepository.deleteAll(
          {
            // where: {
            and: [{productId: productId}, {id: {nin: productIngredientIds}}],
          },
          transaction,
        );
        await this.productOptionRepository.deleteAll(
          {
            // where: {
            and: [{productId: productId}, {id: {nin: productOptionIds}}],
          },
          transaction,
        );

        return this.productRepository.findById(product.id);
      },
    );
  }
}
