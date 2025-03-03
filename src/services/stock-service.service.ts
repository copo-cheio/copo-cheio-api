import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {BalconyFullQuery} from '../blueprints/balcony.blueprint';
import {
  BalconyRepository,
  PlaceRepository,
  StockRepository,
} from '../repositories';
import {MenuRepository} from '../repositories/v1/menu.repository';

@injectable({scope: BindingScope.TRANSIENT})
export class StockService {
  constructor(
    @repository('PlaceRepository')
    public placeRepository: PlaceRepository,

    @repository('BalconyRepository')
    public balconyRepository: BalconyRepository,

    @repository('StockRepository')
    public stockRepository: StockRepository,

    @repository('MenuRepository')
    public menuRepository: MenuRepository,
  ) {}

  /**
   * On a new product added or removed in a menu, all the balconies
   * sharing that menu must have it listed in their stock
   * @returns
   */
  async updateBalconyStockRequirementsByMenu(menuId: string) {
    const balconies = await this.balconyRepository.findAll({where: {menuId}});
    const stockIngredientIds = await this.getMenuIngredientIdList(menuId);
    const output = [];
    for (const balcony of balconies) {
      const result = await this.updateBalconyStockRequirements(
        balcony.id,
        stockIngredientIds,
      );
      output.push(result);
      if (result.newIngredients > 0 || result.outOfStock > 0) {
        // @TODO
        // Notify manager that shit is missing
        // Notify current checked-in clients
      }
    }
    return output;
  }

  /**
   *
   */
  async updateBalconyStockRequirements(balconyId, ingredientIds) {
    const newIngredients = [];
    const currentlyOutOfStock = await this.stockRepository.findAll({
      where: {and: [{balconyId}, {status: 'OUT_OF_STOCK'}, {deleted: false}]},
    });
    for (const ingredientId of ingredientIds) {
      const entry = await this.stockRepository.findOne({
        where: {balconyId: balconyId, ingredientId: ingredientId},
      });
      if (!entry) {
        newIngredients.push(ingredientId);
        await this.stockRepository.create({
          balconyId,
          ingredientId,
          status: 'OUT_OF_STOCK',
        });
      }
    }

    return {
      balconyId,
      newIngredients: newIngredients.length,
      outOfStock: currentlyOutOfStock.length + newIngredients.length,
    };
  }
  /**
   * Gets a list with all the ingredients found in a menu
   * @param menuId
   * @returns
   */
  async getMenuIngredientIdList(menuId: string) {
    const menu: any = await this.menuRepository.findById(menuId, {
      include: [
        {
          relation: 'products',
          scope: {
            include: [
              {
                relation: 'product',
                scope: {
                  include: [{relation: 'ingredients'}, {relation: 'options'}],
                },
              },
            ],
          },
        },
      ],
    });
    const ingredientIds = [];
    const products = menu.products || [];
    for (const menuProduct of products) {
      const ingredients = menuProduct?.product?.ingredients || [];
      const options = menuProduct?.product?.options || [];
      for (const ingredient of ingredients) {
        ingredientIds.push(ingredient.ingredientId);
      }
      for (const ingredient of options) {
        ingredientIds.push(ingredient.ingredientId);
      }
    }
    return [...new Set(ingredientIds)];
  }

  async getMenuIngredientImpactList(menuId: string) {
    const ingredientIds = [];
    const ingredientImpact: any = {};
    const productImpact: any = {};
    const generateImpact = (pointer, id, name, record?: any) => {
      if (!Object.prototype.hasOwnProperty.call(pointer, id)) {
        pointer[id] = {
          id: id,
          name: name,
          record,
          requiredIds: [],
          optionalIds: [],
          required: [],
          optional: [],
        };
      }
    };

    const menu: any = await this.menuRepository.findById(menuId, {
      include: [
        {
          relation: 'products',
          scope: {
            where: {
              deleted: false,
            },
            include: [
              {
                relation: 'product',
                scope: {
                  where: {
                    deleted: false,
                  },
                  include: [
                    {relation: 'thumbnail'},
                    {
                      relation: 'ingredients',
                      scope: {
                        where: {
                          deleted: false,
                        },
                        include: [
                          {
                            relation: 'ingredient',
                            scope: {
                              where: {
                                deleted: false,
                              },
                              include: [{relation: 'thumbnail'}],
                            },
                          },
                        ],
                      },
                    },
                    {
                      relation: 'options',

                      scope: {
                        where: {
                          deleted: false,
                        },
                        include: [
                          {
                            relation: 'ingredient',
                            scope: {
                              where: {
                                deleted: false,
                              },
                              include: [{relation: 'thumbnail'}],
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    });
    const products = menu.products || [];

    for (const menuProduct of products) {
      const ingredients = menuProduct?.product?.ingredients || [];
      const options = menuProduct?.product?.options || [];
      const productId = menuProduct?.productId;
      generateImpact(
        productImpact,
        productId,
        menuProduct.product.name,
        menuProduct.product,
      );

      for (const ingredient of ingredients) {
        const ingredientId = ingredient.ingredientId;
        generateImpact(
          ingredientImpact,
          ingredientId,
          ingredient.ingredient.name,
        );

        if (
          ingredientImpact[ingredientId].requiredIds.indexOf(productId) == -1
        ) {
          ingredientImpact[ingredientId].requiredIds.push(productId);
          ingredientImpact[ingredientId].required.push(menuProduct.product);
        }
        if (productImpact[productId].requiredIds.indexOf(ingredientId) == -1) {
          productImpact[productId].requiredIds.push(ingredientId);
          productImpact[productId].required.push(ingredient.ingredient);
        }

        ingredientIds.push(ingredient.ingredientId);
      }
      for (const ingredient of options) {
        const ingredientId = ingredient.ingredientId;
        generateImpact(
          ingredientImpact,
          ingredientId,
          ingredient.ingredient.name,
        );

        if (
          ingredientImpact[ingredientId].optionalIds.indexOf(productId) == -1
        ) {
          ingredientImpact[ingredientId].optionalIds.push(productId);
          ingredientImpact[ingredientId].optional.push(menuProduct.product);
        }
        if (productImpact[productId].optionalIds.indexOf(ingredientId) == -1) {
          productImpact[productId].optionalIds.push(ingredientId);
          productImpact[productId].optional.push(ingredient.ingredient);
        }
        ingredientIds.push(ingredient.ingredientId);
      }
    }
    return {
      products: Object.values(productImpact),
      ingredients: Object.values(ingredientImpact),
    };
  }

  /**
   * Will update stocks for all user balconies
   * @param balconyId
   * @returns
   */
  async migrateStock(balconyId?: any) {
    let balconies;
    if (balconyId) {
      balconies = await this.balconyRepository.findById(balconyId);
      balconies = [balconies];
    } else {
      balconies = await this.balconyRepository.findAll();
    }
    const response: any = {
      menus: {},
      balconies: {},
    };

    for (const b of balconies) {
      if (!response.balconies[b.id]) {
        response.balconies[b.id] = [];
      }
      if (!response.menus[b.menuId]) {
        response.menus[b.menuId] = [];
        const ingredientIds = [];
        const menu = await this.menuRepository.findById(b.menuId, {
          include: [
            {
              relation: 'products',
              scope: {
                include: [
                  {
                    relation: 'product',
                    scope: {
                      include: [
                        {relation: 'ingredients'},
                        {relation: 'options'},
                      ],
                    },
                  },
                ],
              },
            },
          ],
        });
        const products = menu.products || [];
        for (const p of products) {
          // @ts-ignore
          const ingredients = p?.product?.ingredients || [];
          // @ts-ignore
          const options = p?.product?.options || [];
          for (const ingredient of ingredients) {
            ingredientIds.push(ingredient.ingredientId);
          }
          for (const ingredient of options) {
            ingredientIds.push(ingredient.ingredientId);
          }
        }
        response.menus[b.menuId] = [...new Set(ingredientIds)];
      }
      response.balconies[b.id] = response.menus[b.menuId];
      for (const ing of response.menus[b.menuId]) {
        const entry = await this.stockRepository.findOne({
          where: {balconyId: b.id, ingredientId: ing},
        });
        if (!entry) {
          await this.stockRepository.create({
            balconyId: b.id,
            ingredientId: ing,
            status: 'OUT_OF_STOCK',
          });
        }
      }
    }

    return response.balconies;
  }

  async getBalconyFull(balconyId) {
    const balcony: any = await this.balconyRepository.findById(
      balconyId,
      BalconyFullQuery,
    );
    const stocks = balcony.stocks || [];
    balcony.menu.products = balcony.menu.products || [];
    const inStock = stocks
      .filter((s: any) => s.status == 'IN_STOCK')
      .map((s: any) => s.ingredientId);

    balcony.menu.products = [
      ...balcony.menu.products.map((menuProduct: any) => {
        const product = menuProduct.product;

        let options = product.options || [];

        let ingredients = product.ingredients || [];

        product.available = true;
        menuProduct.available = true;
        options = [
          ...options.map((o: any) => {
            const isAvailable = inStock.indexOf(o.ingredientId) > -1;

            return {
              ...o,
              available: isAvailable,
              ingredient: {...o.ingredient, available: isAvailable},
            };
          }),
        ];
        ingredients = [
          ...ingredients.map((i: any) => {
            const isAvailable = inStock.indexOf(i.ingredientId) > -1;
            if (!isAvailable) {
              // console.log('INGREDIENT NA', i.ingredientId, product);
              product.available = false;
              menuProduct.available = false;
            }
            return {...i, available: isAvailable};
          }),
        ];
        product.options = [...options];
        product.ingredients = [...ingredients];
        return {...menuProduct, product: {...product}};
      }),
    ];

    balcony.inStock = inStock;
    return balcony;
  }

  async getManagerStockStatusOverview(filters: any = []) {
    const places = await this.placeRepository.findAll({
      where: {
        and: [{deleted: false}, {live: true}, ...filters],
      },
    });

    const balconies = await this.balconyRepository.findAll({
      where: {
        and: [{deleted: false}, {placeId: {inq: places.map((p: any) => p.id)}}],
      },
    });
    const stocks = await this.stockRepository.findAll({
      where: {balconyId: {inq: balconies.map((b: any) => b.id)}},
    });

    const totalStocks = stocks.length;
    let missingStocks = 0;
    const affectedBalconies = [];
    const affectedPlaces = [];
    const totalIngredients = [];
    const missingIngredients = [];
    for (const stock of stocks) {
      const {status, ingredientId, balconyId} = stock;
      if (totalIngredients.indexOf(ingredientId) == -1)
        totalIngredients.push(ingredientId);
      if (status == 'OUT_OF_STOCK') {
        missingStocks += 1;
        if (missingIngredients.indexOf(ingredientId) == -1)
          missingIngredients.push(ingredientId);
        if (affectedBalconies.indexOf(balconyId) == -1) {
          const placeId = balconies.find(
            (b: any = {}) => b.id == balconyId,
          )?.placeId;

          affectedBalconies.push(balconyId);
          if (placeId && affectedPlaces.indexOf(placeId) == -1) {
            affectedPlaces.push(placeId);
          }
        }
      }
    }
    return {
      total: totalStocks,
      missingTotal: missingStocks,
      affectedBalconies: affectedBalconies.length,
      affectedPlaces: affectedPlaces.length,
      totalBalconies: [
        ...new Set(balconies.map((b: any) => b.placeId).filter(id => id)),
      ].length,
      totalPlaces: places.length,
      totalIngredients: totalIngredients.length,
      missingIngredients: missingIngredients.length,
    };
  }
}
