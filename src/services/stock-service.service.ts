import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  BalconyRepository,
  MenuRepository,
  PlaceRepository,
  StockRepository,
} from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class StockService {
  constructor(
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,

    @repository(BalconyRepository)
    public balconyRepository: BalconyRepository,

    @repository(StockRepository)
    public stockRepository: StockRepository,

    @repository(MenuRepository)
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
}
