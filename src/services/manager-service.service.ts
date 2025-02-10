import {/* inject, */ BindingScope, inject, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {BalconyFullQuery} from '../blueprints/balcony.blueprint';
import {
  BalconyRepository,
  DevRepository,
  MenuProductRepository,
} from '../repositories';
import {findIdArrayEntries} from '../utils/parser';
import {StockService} from './stock-service.service';

@injectable({scope: BindingScope.TRANSIENT})
export class ManagerService {
  constructor(
    @inject('services.StockService')
    protected stockService: StockService,
    @repository(MenuProductRepository)
    public menuProductRepository: MenuProductRepository,
    @repository(BalconyRepository)
    public balconyRepository: BalconyRepository,
    @repository('DevRepository')
    public devRepository: DevRepository,
  ) {}

  /**
   * PERMISSÕES:
   * 1. listar tudo e editar tudo (pedidos, balcões, menus,stocks )excepto editar pedidos
   * 2. actualizar estados de stocks
   * 3. adicionar ou remover produtos a um menu -> consequentemente irá ter de correr todo o stock list bos balcões associados a esse menu
   *
   * NOTIFICAÇÔES:
   * 1. Evento começou / Terminou
   * 2. Place começou / Terminou
   * 3. Ruptura / actualização de stock
   */

  async addOrUpdateMenuProduct(menuId, productId, priceId, thumbnailId) {
    const record = await this.menuProductRepository.findOne({
      where: {
        and: [{menuId}, {productId}],
      },
    });

    if (record) {
      await this.menuProductRepository.updateById(record.id, {
        priceId,
        thumbnailId,
      });
    } else {
      await this.menuProductRepository.create({
        menuId,
        productId,
        priceId,
        thumbnailId,
      });
      await this.stockService.updateBalconyStockRequirementsByMenu(menuId);
    }
  }

  async updateBalcony(id, payload: any = {}) {
    console.log({id, payload});
    await this.balconyRepository.updateById(id, payload);
    await this.devRepository.migrate(id);
    return this.balconyRepository.findById(id, BalconyFullQuery);
  }

  async createBalcony(payload: any = {}) {
    const balcony = await this.balconyRepository.create(payload);
    const id = balcony.id;
    await this.devRepository.migrate(id);
    return this.balconyRepository.findById(id, BalconyFullQuery);
  }

  async simulateStockStatusForBalconyMenu(menuId: string, balconyId?: any) {
    let balcony;
    let balconyIngredientIds: any = [];
    let balconyRequiredIngredientIds: any = [];
    const menuIngredientIds = await this.getMenuIngredientIdList(menuId);

    if (balconyId) {
      balcony = await this.getBalconyFull(balconyId);
      const menuProducts = balcony?.menu?.products || [];
      for (const product of menuProducts) {
        const ingredients: any = product.ingredients || [];
        const optionalIngredients: any = product.options?.ingredients || [];
        for (const ingredient of ingredients) {
          balconyRequiredIngredientIds.push(ingredient.id);
          balconyIngredientIds.push(ingredient.id);
        }
        for (const option of optionalIngredients) {
          balconyIngredientIds.push(option.id);
        }
      }
    }
    balconyIngredientIds = [...new Set(balconyIngredientIds)];
    balconyRequiredIngredientIds = [...new Set(balconyRequiredIngredientIds)];

    const requiredInStock = findIdArrayEntries(
      menuIngredientIds,
      balconyRequiredIngredientIds,
    );
    const affectedInStock = findIdArrayEntries(
      menuIngredientIds,
      balconyIngredientIds,
    );
    return {
      requiredInStock,
      affectedInStock,
      menuIngredientIds,
      balconyIngredientIds,
      balconyRequiredIngredientIds,
    };
  }

  async updateBalconyStockRequirementsByMenu(menuId) {
    return this.stockService.updateBalconyStockRequirementsByMenu(menuId);
  }
  async updateBalconyStockRequirements(balconyId, ingredientIds) {
    return this.stockService.updateBalconyStockRequirements(
      balconyId,
      ingredientIds,
    );
  }
  async getMenuIngredientIdList(menuId) {
    return this.stockService.getMenuIngredientIdList(menuId);
  }
  async migrateStock(balconyId) {
    return this.stockService.migrateStock(balconyId);
  }
  async getBalconyFull(balconyId) {
    return this.stockService.getBalconyFull(balconyId);
  }
}
