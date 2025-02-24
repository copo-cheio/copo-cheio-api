import {/* inject, */ BindingScope, inject, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {BalconyFullQuery} from '../blueprints/balcony.blueprint';
import {MenuFullQuery} from '../blueprints/menu.blueprint';
import {QueryFilterBaseBlueprint} from '../blueprints/shared/query-filter.interface';
import {
  BalconyRepository,
  DevRepository,
  IngredientRepository,
  MenuProductRepository,
  MenuRepository,
  OrderV2Repository,
  PlaceRepository,
  ProductRepository,
} from '../repositories';
import {PlaceService} from './place.service';
import {ProductService} from './product.service';
import {StockService} from './stock-service.service';
import {TransactionService} from './transaction.service';

@injectable({scope: BindingScope.TRANSIENT})
export class ManagerService {
  constructor(
    @inject('services.StockService')
    protected stockService: StockService,
    @inject('services.ProductService')
    protected productService: ProductService,
    @inject('services.PlaceService')
    protected placeService: PlaceService,
    @repository('MenuProductRepository')
    public menuProductRepository: MenuProductRepository,
    @repository('BalconyRepository')
    public balconyRepository: BalconyRepository,
    @repository('DevRepository')
    public devRepository: DevRepository,
    @repository('MenuRepository')
    public menuRepository: MenuRepository,
    @repository('PlaceRepository')
    public placeRepository: PlaceRepository,
    @repository('OrderV2Repository')
    public orderV2Repository: OrderV2Repository,

    @repository('ProductRepository')
    public productRepository: ProductRepository | any,
    @repository('IngredientRepository')
    public ingredientRepository: IngredientRepository | any,
    @inject('services.TransactionService')
    private transactionService: TransactionService,
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

  /* -------------------------------------------------------------------------- */
  /*                              MANAGER APP PAGES                             */
  /* -------------------------------------------------------------------------- */
  async getHomePage() {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const places =
      await this.placeService.getManagerPlacesWhichAreOrWillOpenToday();
    const orders = await this.findOrders({
      limit: 100000,
      where: {created_at: {gte: oneDayAgo.toISOString()}},
    });
    const totalRevenue = orders.reduce(
      (a: any, b: any) => a + parseFloat(b.details?.totalPrice),
      0,
    );

    const averagePrice =
      orders.length > 0
        ? (parseFloat(totalRevenue) / parseFloat('' + orders.length)).toFixed(2)
        : '0.00';

    const stockStatus = await this.stockService.getManagerStockStatusOverview();
    return {
      count: {
        orders: {
          profit: totalRevenue,
          total: orders.length,
          average: averagePrice,
        },
        places: {
          ongoing: places.ongoing.length,
          today: places.today.length,
          total: places.total,
          full: {ongoing: places.ongoingFull, upcoming: places.upcomingFull},
        },
        stocks: {
          total: stockStatus.total,
          missing: stockStatus.missingTotal,
          affectedBalconies: stockStatus.affectedBalconies,
          affectedPlaces: stockStatus.affectedPlaces,
          totalBalconies: stockStatus.totalBalconies,
          totalPlaces: stockStatus.totalPlaces,
          totalIngredients: stockStatus.totalIngredients,
          missingIngredients: stockStatus.missingIngredients,
        },
      },
      totalRevenue,
      orders: orders.length,
    };
    /* const balconyOrders = await this.devRepository.findAll({
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
 */
  }

  async findOrders(filters: any = {}) {
    const where: any = {
      ...QueryFilterBaseBlueprint.where,
      status: {neq: 'WAITING_PAYMENT'},
      ...(filters?.where || {}),
    };

    const query: any = {
      ...QueryFilterBaseBlueprint,
      where,
      limit: filters?.limit || 100,
      order: ['created_at DESC'],
      include: [
        {
          relation: 'details',
        },
        {relation: 'place'},
      ],
    };
    return this.orderV2Repository.findAll(query);
  }
  /* -------------------------------------------------------------------------- */
  /*                               MANAGER ROUTES                               */
  /* -------------------------------------------------------------------------- */
  async createProduct(payload: any = {}) {
    const {name, description, thumbnailId, tagIds} = payload;
    const {ingredientIds, optionIngredientIds} = payload;
    return this.transactionService.execute(async tx => {
      const parseProductIngredient = (ingredientId: any) => {
        return {
          id: ingredientId,
        };
      };
      const product = await this.productService.create({
        name,
        description,
        thumbnailId,
        tagIds,
        ingredients: ingredientIds.map(parseProductIngredient),
        options: optionIngredientIds.map(parseProductIngredient),
      });
      return product;
    });
  }
  async updateProductById(id, payload: any = {}) {
    const {name, description, thumbnailId, tagIds} = payload;
    const {ingredientIds, optionIngredientIds} = payload;
    return this.transactionService.execute(async tx => {
      const parseProductIngredient = (ingredientId: any) => {
        return {
          id: ingredientId,
        };
      };
      const product = await this.productService.updateProduct(id, {
        name,
        description,
        thumbnailId,
        tagIds,
        ingredients: ingredientIds.map(parseProductIngredient),
        options: optionIngredientIds.map(parseProductIngredient),
      });
      return product;
    });
  }

  async createPlace(payload: any = {}) {
    //...
  }
  async updatePlace(id: string, place: any = {}) {
    const openingHours: any = place.openingHours;
    delete place.openingHours;
    if (Array.isArray(openingHours)) {
      await this.placeService.updatePlaceOpeningHours(id, openingHours);
    }
    const record: any = await this.placeRepository.updateById(id, place);
    // const record:any = await this.placeRepository.create(place);
    await this.placeService.findOrCreateCheckInQrCode(id);
    return record;
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

  /* -------------------------------------------------------------------------- */
  /*                                   HELPERS                                  */
  /* -------------------------------------------------------------------------- */

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
}
