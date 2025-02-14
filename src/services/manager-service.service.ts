import {/* inject, */ BindingScope, inject, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {BalconyFullQuery} from '../blueprints/balcony.blueprint';
import {MenuFullQuery} from '../blueprints/menu.blueprint';
import {
  BalconyRepository,
  DevRepository,
  MenuProductRepository,
  MenuRepository,
} from '../repositories';
import {StockService} from './stock-service.service';

@injectable({scope: BindingScope.TRANSIENT})
export class ManagerService {
  constructor(
    @inject('services.StockService')
    protected stockService: StockService,
    @repository('MenuProductRepository')
    public menuProductRepository: MenuProductRepository,
    @repository('BalconyRepository')
    public balconyRepository: BalconyRepository,
    @repository('DevRepository')
    public devRepository: DevRepository,
    @repository('MenuRepository')
    public menuRepository: MenuRepository,
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

  async getHomePage() {
    const now = Date.now();
    const balconyOrders = await this.devRepository.findAll({
      where: {and: [{app: 'staff', action: 'balcony-orders'}]},
    });
    const balconyOrdersData = balconyOrders.map(
      (balconyOrder: any) => balconyOrder.data,
    );
    const revenue = balconyOrdersData.flat().map(b => {
      return {
        created_at: b.created_at,
        price: b?.order?.totalPrice || b?.data?.order?.totalPrice,
      };
    });
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const filtered = revenue.filter(
      item => new Date(item.created_at) < oneDayAgo,
    );
    const totalRevenue = filtered.reduce((a, b) => a + b.price, 0);

    return {totalRevenue, orders: revenue.length};
  }

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

  async findMenus() {
    return this.menuRepository.findAll({
      ...MenuFullQuery,
      include: [...MenuFullQuery.include, {relation: 'balconies'}],
    });
  }

  async findBalconyStocks(balconyId?: any) {
    const balconies: any = [];
    let balconyIds: any = [];
    if (balconyId) {
      balconyIds = [balconyId];
    } else {
      const allBalconies = await this.balconyRepository.findAll();
      balconyIds = allBalconies.map(b => b.id);
    }

    for (const id of balconyIds) {
      const balcony = await this.stockService.getBalconyFull(id);
      balconies.push(balcony);
    }
    return balconyId ? balconies[0] : balconies;
  }
}
