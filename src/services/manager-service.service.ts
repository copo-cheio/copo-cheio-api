import {/* inject, */ BindingScope, inject, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {BalconyFullQuery} from '../blueprints/balcony.blueprint';
import {MenuFullQuery} from '../blueprints/menu.blueprint';
import {QueryFilterBaseBlueprint} from '../blueprints/shared/query-filter.interface';
import {DEFAULT_MODEL_ID} from '../constants';
import {
  BalconyRepository,
  CompanyRepository,
  ContactsRepository,
  DevRepository,
  EventInstanceRepository,
  IngredientRepository,
  MenuProductRepository,
  MenuRepository,
  OrderV2Repository,
  PlaceRepository,
  PriceRepository,
  ProductOptionRepository,
  ProductRepository,
  StockRepository,
} from '../repositories';
import {PlaceInstanceRepository} from '../repositories/v1/place-instance.repository';
import {EventService} from './event.service';
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
    @inject('services.EventService')
    protected eventService: EventService,
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
    @repository('PlaceInstanceRepository')
    public placeInstanceRepository: PlaceInstanceRepository,
    @repository('EventInstanceRepository')
    public eventInstanceRepository: EventInstanceRepository,
    @repository('PriceRepository')
    public priceRepository: PriceRepository,
    @repository('OrderV2Repository')
    public orderV2Repository: OrderV2Repository,
    @repository('CompanyRepository')
    public companyRepository: CompanyRepository,
    @repository('ContactsRepository')
    public contactRepository: ContactsRepository,

    @repository('ProductRepository')
    public productRepository: ProductRepository | any,
    @repository('ProductOptionRepository')
    public productOptionRepository: ProductOptionRepository | any,
    @repository('IngredientRepository')
    public ingredientRepository: IngredientRepository | any,
    @inject('services.TransactionService')
    private transactionService: TransactionService,
    @repository('StockRepository')
    public stockRepository: StockRepository,
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
    const events =
      await this.eventService.getManagerEventsWhichAreOrWillOpenToday();
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
          ...places,
          full: {ongoing: places.ongoingFull, upcoming: places.upcomingFull},
        },
        events: {
          ...events,
          full: {ongoing: events.ongoingFull, upcoming: events.upcomingFull},
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
  }

  async getStocksPage() {
    const menus: any = await this.menuRepository.findAll({
      ...MenuFullQuery,
      include: [...MenuFullQuery.include, {relation: 'balconies'}],
    });

    const stocks: any = {};
    for (const menu of menus || []) {
      const menuId = menu.id;

      const balconies = menu.balconies;
      const balconyIds = balconies.map(b => b.id);
      for (const product of menu.products || []) {
        const productId = product.product.id;
        for (const ingredient of product?.product?.ingredients || []) {
          const ingredientId = ingredient.ingredientId;
          if (!stocks[ingredientId]) {
            stocks[ingredientId] = {
              ingredient,
              ingredientId,
              productIds: [],
              requiredIds: [],
              balconyIds: [],
              menuIds: [],
              products: [],
              required: [],
              menus: [],
              balconies: [],
              optionalIds: [],
              optional: [],
              outOfStockBalconies: 0,
              outOfStockProducts: 0,
              outOfStockOptions: 0,
            };
          }

          if (stocks[ingredientId].productIds.indexOf(productId) == -1) {
            stocks[ingredientId].productIds.push(productId);
            //stocks[ingredientId].products.push(product);
          }
          if (stocks[ingredientId].requiredIds.indexOf(productId) == -1) {
            stocks[ingredientId].requiredIds.push(productId);
            //stocks[ingredientId].required.push(product);
          }
          if (stocks[ingredientId].menuIds.indexOf(menuId) == -1) {
            stocks[ingredientId].menuIds.push(menuId);
            //stocks[ingredientId].menus.push(menu);
          }
          for (const balcony of balconies) {
            const balconyId = balcony.id;
            if (stocks[ingredientId].balconyIds.indexOf(balconyId) == -1) {
              const stock = await this.stockRepository.findOne({
                where: {
                  and: [{balconyId}, {ingredientId}],
                },
              });
              stocks[ingredientId].balconyIds.push(balconyId);
              stocks[ingredientId].balconies.push({
                /*     balcony,
                stock, */
                balconyId,
                status: stock?.status,
                required: [
                  ...new Set(
                    (menu.products || []).map(p =>
                      [
                        ...new Set(
                          (p.product.ingredients || [])
                            .map(i => i.ingredientId)
                            .filter(i => i.indexOf(ingredientId) > -1)
                            .flat()
                            .flat(),
                        ),
                      ].flat(),
                    ),
                  ),
                ],

                optional: [
                  ...new Set(
                    (menu.products || [])
                      .map(p =>
                        [
                          ...new Set(
                            (p.product.options || [])
                              .map(i => i.ingredientId)
                              .filter(i => i.indexOf(ingredientId) > -1)
                              .flat()
                              .flat(),
                          ),
                        ].flat(),
                      )
                      .flat(),
                  ),
                ],
                items: (menu.products || []).map(p => p.product.id),
              });
            }
          }
        }
        for (const option of product?.product?.options || []) {
          const ingredientId = option.ingredientId;

          if (!stocks[ingredientId]) {
            stocks[ingredientId] = {
              ingredient: option,
              ingredientId,

              productIds: [],
              requiredIds: [],
              balconyIds: [],
              menuIds: [],
              products: [],
              required: [],
              menus: [],
              balconies: [],
              optionalIds: [],
              optional: [],
              outOfStockBalconies: 0,
              outOfStockProducts: 0,
              outOfStockOptions: 0,
            };
          }

          if (stocks[ingredientId].optionalIds.indexOf(productId) == -1) {
            stocks[ingredientId].optionalIds.push(productId);
            // stocks[ingredientId].optional.push(product);
          }
          if (stocks[ingredientId].menuIds.indexOf(menuId) == -1) {
            stocks[ingredientId].menuIds.push(menuId);
            //stocks[ingredientId].menus.push(menu);
          }
          for (const balcony of balconies) {
            const balconyId = balcony.id;
            if (stocks[ingredientId].balconyIds.indexOf(balconyId) == -1) {
              const stock = await this.stockRepository.findOne({
                where: {
                  and: [{balconyId}, {ingredientId}],
                },
              });
              stocks[ingredientId].balconyIds.push(balconyId);
              stocks[ingredientId].balconies.push({
                /*     balcony,
                stock, */
                balconyId,
                status: stock?.status,
                items: (menu.products || []).map(p => p.product.id),
                required: [
                  ...new Set(
                    (menu.products || []).map(p =>
                      [
                        ...new Set(
                          (p.product.ingredients || [])
                            .map(i => i.ingredientId)
                            .filter(i => i.indexOf(ingredientId) > -1)
                            .flat()
                            .flat(),
                        ),
                      ].flat(),
                    ),
                  ),
                ],
                optional: [
                  ...new Set(
                    (menu.products || [])
                      .map(p =>
                        [
                          ...new Set(
                            (p.product.options || [])
                              .map(i => i.ingredientId)
                              .filter(i => i.indexOf(ingredientId) > -1)
                              .flat()
                              .flat(),
                          ),
                        ].flat(),
                      )
                      .flat(),
                  ),
                ],
              });
            }
          }
        }
      }
    }

    return Object.values(stocks).map((b: any) => {
      return {
        ingredient: {
          ...b.ingredient.ingredient,
          thumbnail: b.ingredient?.ingredient?.thumbnail?.url,
        },
        ingredientId: b.ingredientId,
        productIds: b.productIds,
        requiredIds: b.requiredIds,
        optionalIds: b.optionalIds,
        menuIds: b.menuIds,
        impact: {
          balconies: {
            total: b.balconies.length,
            outOfStock: b.balconies
              .filter((c: any) => c.status == 'OUT_OF_STOCK')
              .map((c: any) => {
                return {
                  balconyId: c.balconyId,
                  status: c.status,
                  required: [...new Set(c.required.flat())],
                  optional: [...new Set(c.optional.flat())],
                  total: c.items,
                };
              }),
            inStock: b.balconies
              .filter((c: any) => c.status == 'IN_STOCK')
              .map((c: any) => {
                return {
                  balconyId: c.balconyId,
                  status: c.status,
                  required: [...new Set(c.required.flat())],
                  optional: [...new Set(c.optional.flat())],
                  total: c.items,
                };
              }),
          },
        },
      };
    });
  }

  async getSchedulePage() {
    const today = new Date();
    today.setHours(0, 0, 0);

    const future: any = new Date();
    future.setFullYear(future.getFullYear() + 1);
    future.setHours(0, 0, 0);

    const eventNames: any = [];
    const placeNames: any = [];

    let placeInstances: any = await this.placeInstanceRepository.findAll({
      where: {and: [{startDate: {gte: today}}, {endDate: {lte: future}}]},
      include: [{relation: 'place', scope: {fields: {name: true}}}],
    });
    let eventInstances: any = await this.eventInstanceRepository.findAll({
      where: {and: [{startDate: {gte: today}}, {endDate: {lte: future}}]},
      include: [{relation: 'event', scope: {fields: {name: true}}}],
    });
    placeInstances = placeInstances.map((e: any) => {
      if (placeNames.indexOf(e.place.name) == -1) {
        placeNames.push(e.place.name);
      }
      return {
        type: 'place',
        id: e.id,
        placeId: e.placeId,
        title: e.place.name,
        start: new Date(e.startDate),
        end: new Date(e.endDate),
      };
    });
    eventInstances = eventInstances.map((e: any) => {
      if (eventNames.indexOf(e.event.name) == -1) {
        eventNames.push(e.event.name);
      }
      return {
        type: 'event',
        id: e.id,
        eventId: e.eventId,
        title: e.event.name,
        start: new Date(e.startDate),
        end: new Date(e.endDate),
      };
    });

    return {
      items: [...placeInstances, ...eventInstances],
      eventNames: eventNames.map((name: string) => {
        return {
          id: name,
          name: name,
          title: name,
          type: 'schedule-event',
        };
      }),
      placeNames: placeNames.map((name: string) => {
        return {
          id: name,
          name: name,
          title: name,
          type: 'schedule-place',
        };
      }),
    };
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
  async createCompany(payload: any = {}) {
    const {name, description, coverId} = payload;
    const {
      email,
      phone,
      website,
      social_facebook,
      social_instagram,
      social_threads,
    } = payload.contacts || {};

    return this.transactionService.execute(async tx => {
      const company = await this.companyRepository.create({
        name,
        description,
        coverId,
      });
      const contacts = await this.contactRepository.create({
        refId: company.id,
        email,
        phone,
        website,
        social_facebook,
        social_instagram,
        social_threads,
      });

      return {...company, contacts};
    });
  }
  async updateCompany(id, payload: any = {}) {
    const {name, description, coverId} = payload;
    const {
      email,
      phone,
      website,
      social_facebook,
      social_instagram,
      social_threads,
    } = payload.contacts || {};

    return this.transactionService.execute(async tx => {
      let company = await this.companyRepository.findById(id);
      let contacts = await this.contactRepository.findOne({
        where: {and: [{refId: id}, {deleted: false}]},
      });
      const companyPayload: any = {};
      for (const key of Object.keys({name, description, coverId})) {
        const value = payload?.[key];
        if (!value) continue;
        if (company[key] !== value) {
          companyPayload[key] = value;
        }
      }

      if (Object.keys(companyPayload).length > 0) {
        await this.companyRepository.updateById(id, companyPayload);
        company = await this.companyRepository.findById(id);
      }

      if (!contacts) {
        return company;
      }

      const contactsPayload: any = {};
      for (const key of Object.keys({
        email,
        phone,
        website,
        social_facebook,
        social_instagram,
        social_threads,
      })) {
        const value = payload?.contacts?.[key];
        if (!value) continue;
        if (contacts?.[key] !== value) {
          contactsPayload[key] = value;
        }
      }

      if (Object.keys(contactsPayload).length > 0) {
        await this.contactRepository.updateById(contacts.id, contactsPayload);
        contacts = await this.contactRepository.findById(contacts.id);
      }

      return {...company, contacts};
    });
  }

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

  async createMenuProduct(payload: any) {
    const price = await this.priceRepository.create({
      price: payload.price,
      currencyId: DEFAULT_MODEL_ID.currencyId,
    });

    for (const option of payload.options) {
      const productOption = await this.productOptionRepository.findById(
        option.id,
      );
      await this.priceRepository.updateById(productOption.priceId, {
        price: option.price.price,
      });
      await this.productOptionRepository.updateById(productOption.id, {
        ...productOption,
        includedByDefault: option.includedByDefault,
      });
    }
    const menuProduct = await this.addOrUpdateMenuProduct(
      payload.menuId,
      payload.productId,
      price.id,
      payload.thumbnailId,
    );

    return menuProduct;
  }
  async updateMenuProduct(id: string, payload: any) {
    let menuProduct = await this.menuProductRepository.findById(id);
    if (menuProduct && payload.price) {
      await this.priceRepository.updateById(menuProduct.priceId, {
        price: payload.price,
        currencyId: DEFAULT_MODEL_ID.currencyId,
      });
    }

    for (const option of payload.options) {
      const productOption = await this.productOptionRepository.findById(
        option.id,
      );
      await this.priceRepository.updateById(productOption.priceId, {
        price: option.price.price,
      });
      await this.productOptionRepository.updateById(productOption.id, {
        ...productOption,
        includedByDefault: option.includedByDefault,
      });
    }
    menuProduct = await this.addOrUpdateMenuProduct(
      menuProduct.menuId,
      menuProduct.productId,
      menuProduct.priceId,
      payload.thumbnailId || menuProduct.thumbnailId,
    );

    return menuProduct;
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
    let record = await this.menuProductRepository.findOne({
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
    record = await this.menuProductRepository.findOne({
      where: {
        and: [{menuId}, {productId}],
      },
    });
    return record;
  }
}
