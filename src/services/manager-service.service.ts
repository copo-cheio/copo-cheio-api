import {AuthenticationBindings} from '@loopback/authentication';
import {/* inject, */ BindingScope, inject, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {BalconyFullQuery} from '../blueprints/balcony.blueprint';
import {
  EventManagerQueryFull,
  EventsQuery,
} from '../blueprints/event.blueprint';
import {MenuFullQuery} from '../blueprints/menu.blueprint';
import {
  PlaceManagerQueryFull,
  PlacesQuery,
} from '../blueprints/place.blueprint';
import {ProductQueryFull} from '../blueprints/product.blueprint';
import {
  ExtendQueryFilterWhere,
  QueryFilterBaseBlueprint,
} from '../blueprints/shared/query-filter.interface';
import {DEFAULT_MODEL_ID} from '../constants';
import {
  AddressRepository,
  BalconyRepository,
  CompanyRepository,
  ContactsRepository,
  DevRepository,
  EventInstanceRepository,
  EventRepository,
  IngredientRepository,
  MenuProductRepository,
  OpeningHoursRepository,
  OrderV2Repository,
  PlaceRepository,
  PlaylistRepository,
  PriceRepository,
  ProductOptionRepository,
  ProductRepository,
  RegionRepository,
  StaffRepository,
  StockRepository,
  TeamRepository,
  TeamStaffRepository,
  UserRepository,
} from '../repositories';
import {MenuRepository} from '../repositories/v1/menu.repository';
import {PlaceInstanceRepository} from '../repositories/v1/place-instance.repository';
import {AuthService} from './auth.service';
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
    @inject('services.AuthService')
    protected authService: AuthService,
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
    @repository('AddressRepository')
    public addressRepository: AddressRepository,
    @repository('RegionRepository')
    public regionRepository: RegionRepository,
    @repository('PlaceRepository')
    public placeRepository: PlaceRepository,
    @repository('EventRepository')
    public eventRepository: EventRepository,
    @repository('PlaylistRepository')
    public playlistRepository: PlaylistRepository,
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
    @repository('TeamRepository')
    public teamRepository: TeamRepository,
    @repository('TeamStaffRepository')
    public teamStaffRepository: TeamStaffRepository,
    @repository('StaffRepository')
    public staffRepository: StaffRepository,
    @repository('OpeningHoursRepository')
    public openingHoursRepository: OpeningHoursRepository,
    @repository('UserRepository')
    public userRepository: UserRepository,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private currentUser: UserProfile, // Inject the current user profile
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
  /*                                    STAFF                                   */
  /* -------------------------------------------------------------------------- */
  async getCompanyStaff() {
    return this.staffRepository.findAll({
      where: {
        and: [{companyId: this.currentUser.companyId}, {deleted: false}],
      },
      include: [{relation: 'user'}],
    });
  }
  /* -------------------------------------------------------------------------- */
  /*                              MANAGER APP PAGES                             */
  /* -------------------------------------------------------------------------- */
  async getHomePage() {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const places =
      await this.placeService.getManagerPlacesWhichAreOrWillOpenToday([
        {companyId: this.currentUser.companyId},
      ]);
    const events =
      await this.eventService.getManagerEventsWhichAreOrWillOpenToday([
        {
          companyId: this.currentUser.companyId,
        },
      ]);
    const orders = await this.findOrders({
      limit: 5000,
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

    const stockStatus = await this.stockService.getManagerStockStatusOverview([
      {
        companyId: this.currentUser.companyId,
      },
    ]);
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

  async getOnboardingPage() {
    const staff = await this.staffRepository.findOne({
      where: {
        and: [
          {userId: this.currentUser.id},
          {role: {inq: ['owner', 'admin', 'manager']}},
        ],
      },
    });

    return staff?.companyId;
  }
  async getPlacePage(id: string) {
    return this.executeManagerAction(
      [{repository: 'placeRepository', id}],
      async () => {
        return this.placeRepository.findById(id, PlaceManagerQueryFull);
      },
    );
  }

  async getPlacesPage() {
    return this.executeManagerAction([], async () => {
      return this.placeRepository.findAll(
        ExtendQueryFilterWhere(PlacesQuery, [
          {companyId: this.currentUser.companyId},
        ]),
      );
    });
  }

  async getTeamsPage() {
    return this.executeManagerAction([], async () => {
      return this.teamRepository.findAll(
        ExtendQueryFilterWhere(
          {
            include: [
              {relation: 'cover'},
              {relation: 'events'},
              {relation: 'places'},
              {relation: 'staff', scope: {include: [{relation: 'user'}]}},
            ],
          },
          [{companyId: this.currentUser.companyId}, {deleted: false}],
        ),
      );
    });
  }

  async getTeamPage(id) {
    return this.executeManagerAction(
      [{repository: 'teamRepository', id}],
      async () => {
        return this.teamRepository.findById(
          id,

          {
            include: [
              {relation: 'cover'},
              {relation: 'events', scope: {include: [{relation: 'cover'}]}},
              {relation: 'places', scope: {include: [{relation: 'cover'}]}},
              {relation: 'staff', scope: {include: [{relation: 'user'}]}},
            ],
          },
        );
      },
    );
  }

  async getProductsPage() {
    return this.executeManagerAction([], async () => {
      return this.productRepository.findAll(
        ExtendQueryFilterWhere(ProductQueryFull, [
          {deleted: false},
          {companyId: this.currentUser.companyId},
        ]),
      );
    });
  }
  async getStocksPageV2(managerBalconies?: any) {
    // PROOF OF CONCEPT
    const balconies =
      managerBalconies ||
      (await this.balconyRepository.findAll({
        include: [
          {relation: 'cover'},
          {relation: 'place', scope: {include: [{relation: 'cover'}]}},
        ],
      }));
    const response: any = [];
    const outOfStockIngredientIds = [];
    const outOfStockIngredients = [];
    const stockIngredientIds = [];
    const stockIngredients = [];
    for (const b of balconies) {
      const balconyId = b.id; //'efb6c280-f40b-403c-b32e-f9c4a58b21cc';
      const balcony = await this.balconyRepository.findById(balconyId, {
        include: [
          {relation: 'place'},
          {
            relation: 'stocks',
            scope: {
              where: {
                deleted: false,
              },
              include: [
                {
                  relation: 'ingredient',
                  scope: {include: [{relation: 'thumbnail'}]},
                },
              ],
            },
          },
        ],
      });
      const impact: any = await this.stockService.getMenuIngredientImpactList(
        balcony.menuId,
      );
      const stock = balcony.stocks.map((s: any) => {
        return {
          id: s.id,
          ingredientId: s.ingredientId,
          status: s.status,
          name: s.ingredient.name,
        };
      });
      /* const balconyStock = /v2/manager/stocks-2 */
      impact.outOfStockIngredientIds = [];
      for (const item of stock) {
        const ingredientId = item.ingredientId;
        const index = impact.ingredients.findIndex(
          (i: any) => i.id == ingredientId,
        );
        if (stockIngredientIds.indexOf(ingredientId) == -1) {
          stockIngredientIds.push(ingredientId);
          stockIngredients.push(item);
        }
        if (index > -1) {
          impact.ingredients[index].status = item.status;
          if (
            item.status == 'OUT_OF_STOCK' &&
            impact.outOfStockIngredientIds.indexOf(ingredientId) == -1
          ) {
            impact.outOfStockIngredientIds.push(ingredientId);
          }
          if (
            item.status == 'OUT_OF_STOCK' &&
            outOfStockIngredientIds.indexOf(ingredientId) == -1
          ) {
            outOfStockIngredientIds.push(ingredientId);
            outOfStockIngredients.push(item);
          }
        } else {
          console.log({index, ingredientId});
        }
      }
      impact.products = impact.products.map((ip: any) => {
        return {
          ...ip,
          status: ip.requiredIds.some(element =>
            impact.outOfStockIngredientIds.includes(element),
          )
            ? 'OUT_OF_STOCK'
            : ip.optionalIds.some(element =>
                  impact.outOfStockIngredientIds.includes(element),
                )
              ? 'LIMITED'
              : 'IN_STOCK',
        };
      });
      response.push({balcony, impact});
    }
    response.sort((a: any, b: any) =>
      a.balcony.name > b.balcony.name ? 1 : -1,
    );
    return {items: response, outOfStockIngredients, stockIngredients};
  }

  async getStockPageV2(balconyId: string) {
    const balcony = await this.balconyRepository.findById(balconyId);
    const result = await this.getStocksPageV2([balcony]);
    const topProducts = await this.orderV2Repository.findAll({
      limit: 100,
      order: ['created_at DESC'],
      where: {balconyId},
      include: [
        {
          relation: 'items',
          scope: {
            include: [
              {
                relation: 'menuProduct',
                scope: {
                  include: [
                    {
                      relation: 'product',
                      scope: {
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
    });
    return {...result, item: result.items[0], topProducts};
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
  /*                                    EVENT                                   */
  /* -------------------------------------------------------------------------- */

  async getEventPage(id: string) {
    return this.eventRepository.findById(id, EventManagerQueryFull);
  }
  async getEventsPage() {
    return this.executeManagerAction([], async () => {
      return this.eventRepository.findAll(
        ExtendQueryFilterWhere(EventsQuery, [
          {companyId: this.currentUser.companyId},
        ]),
      );
    });
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

      const staff = await this.staffRepository.create({
        userId: this.currentUser.id,
        role: 'admin',
        companyId: company.id,
        roles: ['admin'],
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
      const team = await this.teamRepository.create({
        name: name + 'team',
        companyId: company.id,
        coverId: coverId,
      });

      const teamStaff = await this.teamStaffRepository.create({
        teamId: team.id,
        staffId: staff.id,
      });

      await this.authService.signInActivityV2(this.currentUser.id, 'admin');
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
    this.devRepository.migrate();
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

  /* -------------------------------------------------------------------------- */
  /*                                    PLACE                                   */
  /* -------------------------------------------------------------------------- */
  async createPlace(payload: any = {}) {
    // Precisa de teamId
    // Precisa de address
    // Precisa de opening hours
    // Precisa de companyId
    // Precisa de contactsId
    // Precisa de tagIds
    // Precisa de playlistId
    // @TODO Falta address e playlist que n tou com coragem agr
    return this.transactionService.execute(async tx => {
      let {
        coverId,
        name,
        description,
        contacts,
        tagIds,
        venueIds,
        activityIds,
        musicIds,

        teamId,
        address,
      } = payload;
      tagIds = [
        ...new Set([
          ...(venueIds || []),
          ...(activityIds || []),
          ...(musicIds || []),
        ]),
      ];

      tagIds = tagIds.sort();

      const region = await this.regionRepository.findOne({
        where: {
          name: (address?.region?.name || '').toLowerCase().trim(),
        },
      });
      const regionId = region?.id || DEFAULT_MODEL_ID.regionId;

      const addressRecord = await this.addressRepository.create({
        address: address.address,
        postal: address.postal,
        latitude: address.latitude,
        longitude: address.longitude,
        type: 'POI',
        name: payload.name,
        long_label: [name, address?.address, address?.postal].join(','),
        short_label: [
          address?.address,
          address?.region?.name,
          address?.postal,
        ].join(','),
        regionId: regionId,
        countryId: region?.countryId || DEFAULT_MODEL_ID.countryId,
      });
      let team: any;
      if (teamId) {
        team = await this.teamRepository.findById(teamId);
      }
      if (!team) {
        team = await this.teamRepository.findOne({
          where: {companyId: this.currentUser.companyId},
        });
      }

      const playlist = await this.playlistRepository.create({
        name: name + ' playlist',
      });

      const placeRecord = await this.placeRepository.create({
        name,
        description,
        coverId,
        tagIds,
        live: false,
        addressId: addressRecord.id,
        playlistId: playlist.id,
        teamId: team.id,
        companyId: this.currentUser.companyId,
      });

      const contactRecord = await this.contactRepository.create({
        refId: placeRecord.id,
        ...contacts,
      });

      for (let i = 0; i < 7; i++) {
        await this.openingHoursRepository.create({
          dayofweek: i,

          openhour: '10:00',
          closehour: '20:00',
          placeId: placeRecord.id,

          active: false,
        });
      }
      return placeRecord;
    });
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

  async updatePlaceV2(id: string, place: any = {}) {
    return this.transactionService.execute(async tx => {
      let {
        coverId,
        name,
        description,
        contacts,
        tagIds,
        venueIds,
        activityIds,
        musicIds,
        foodIds,
        openingHours,
        teamId,
        address,
        live,
      } = place;
      tagIds = [
        ...new Set([
          ...(venueIds || []),
          ...(activityIds || []),
          ...(musicIds || []),
          ...(foodIds || []),
        ]),
      ];

      tagIds = tagIds.sort();

      // Place itself
      let placeUpdateRequired = false;
      const placePayload = {
        name,
        description,
        coverId,
        teamId,
        tagIds,
        live: live || false,
      };
      const placeRecord = await this.placeRepository.findById(
        id,
        PlaceManagerQueryFull,
      );
      for (const key of Object.keys(placePayload)) {
        if (placePayload[key] !== placeRecord[key]) {
          placeUpdateRequired = true;
          break;
        }
      }
      if (placeUpdateRequired) {
        await this.placeRepository.updateById(id, placePayload);
      }
      // Contacts
      const contactsPayload = contacts;
      const contactsRecord = await this.contactRepository.findOne({
        where: {refId: id},
        /*    include: [{relation: 'region'}], */
      });
      let contactsUpdateRequired = false;
      for (const key of Object.keys(contactsPayload || {})) {
        if (
          contactsRecord[key] !== contactsPayload[key] &&
          contactsPayload[key] !== null
        ) {
          contactsUpdateRequired = true;
          break;
        }
      }

      if (contactsUpdateRequired) {
        await this.contactRepository.updateById(
          contactsRecord.id,
          contactsPayload,
        );
      }

      const addressRecord = await this.addressRepository.findById(
        placeRecord.addressId,
      );
      // Region
      const region = address?.region || {};
      const regionName = (region?.name || '').toLowerCase().trim();
      let regionRecord: any;

      if (regionName) {
        regionRecord = await this.regionRepository.findOne({
          where: {name: regionName},
        });
        if (!regionRecord) {
          regionRecord = await this.regionRepository.create({
            name: regionName,
            countryId: DEFAULT_MODEL_ID.country,
          });
        }
      } else if (addressRecord?.regionId) {
        regionRecord = await this.regionRepository.findById(
          addressRecord.regionId,
        );
      }

      // Address
      const addressPayload: any = {
        name: name,
        address: address.address,
        postal: address.postal,
        regionId: regionRecord?.id,
        latitude: address.latitude,
        longitude: address.longitude,
      };

      let addressUpdateRequired = false;
      for (const key of Object.keys(addressPayload || {})) {
        if (
          addressRecord[key] !== addressPayload[key] &&
          addressPayload[key] !== null
        ) {
          addressUpdateRequired = true;
          break;
        }
      }

      if (addressUpdateRequired) {
        addressPayload.long_label = [
          address.address,
          regionRecord?.name,
          address.postal,
        ].join(',');

        await this.addressRepository.updateById(
          addressRecord.id,
          addressPayload,
        );
      }

      let playlistUpdateRequired = false;
      const playlistRecord = await this.playlistRepository.findById(
        placeRecord.playlistId,
      );
      const playlistPayload = {
        url: place?.playlist?.url,
        name: place?.playlist?.name,
        description: place?.playlist?.description,
      };
      for (const key of Object.keys(playlistPayload)) {
        const original = (playlistRecord[key] || '')?.trim();
        const current = (playlistPayload[key] || '')?.trim();
        if (current && current?.length > 0) {
          if (original !== current) {
            playlistUpdateRequired = true;
          }
        }
      }
      if (playlistUpdateRequired) {
        await this.playlistRepository.updateById(
          placeRecord.playlistId,
          playlistPayload,
        );
      }

      if (Array.isArray(openingHours)) {
        await this.placeService.updatePlaceOpeningHours(id, openingHours);
      }

      // const record:any = await this.placeRepository.create(place);
      await this.placeService.findOrCreateCheckInQrCode(id);

      return placeRecord;
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                                    EVENT                                   */
  /* -------------------------------------------------------------------------- */
  async createEvent(payload: any = {}) {
    // Precisa de teamId
    // Precisa de place
    // Precisa de opening hours
    // Precisa de companyId
    // Precisa de contactsId
    // Precisa de tagIds
    // Precisa de playlistId
    // @TODO Falta address e playlist que n tou com coragem agr
    return payload;
  }
  async updateEvent(id: string, place: any = {}) {
    /*     const openingHours: any = place.openingHours;
    delete place.openingHours;
    if (Array.isArray(openingHours)) {
      await this.placeService.updatePlaceOpeningHours(id, openingHours);
    }
    const record: any = await this.placeRepository.updateById(id, place);
    // const record:any = await this.placeRepository.create(place);
    await this.placeService.findOrCreateCheckInQrCode(id);
    return record;
    */

    return;
  }

  getNextDateWithWeekday({start, weekday}) {
    const today = new Date();
    const currentDay = today.getDay(); // 0 (Sunday) - 6 (Saturday)

    // Calculate days until next desired weekday
    let daysUntilNext = (weekday - currentDay + 7) % 7;
    if (daysUntilNext === 0) daysUntilNext = 7; // If today is the same weekday, get next week

    // Get the next occurrence of the given weekday
    const nextDate = new Date();
    nextDate.setDate(today.getDate() + daysUntilNext);

    // Set the start time
    const [hours, minutes] = start.split(':').map(Number);
    nextDate.setHours(hours, minutes, 0, 0);

    return nextDate;
  }
  async updateEventV2(id: string, payload: any = {}) {
    return this.transactionService.execute(async tx => {
      let {
        coverId,
        name,
        placeId,
        description,
        contacts,
        tagIds,
        eventIds,
        musicIds,
        activityIds,
        teamId,
        playlist,
        date,
      } = payload;
      tagIds = [
        ...new Set([
          ...(eventIds || []),
          ...(activityIds || []),
          ...(musicIds || []),
        ]),
      ];

      tagIds = tagIds.sort();

      // Place itself
      let eventUpdateRequired = false;

      const recurrenceType = date?.frequency;
      const isRecurring =
        recurrenceType && recurrenceType == 'none'
          ? false
          : recurrenceType
            ? true
            : null;
      const eventPayload: any = {
        name,
        description,
        coverId,
        teamId,
        tagIds,
        placeId,
        recurrenceTyoe: date?.frequency,
      };
      if (typeof isRecurring == 'string') {
        eventPayload.isRecurring = isRecurring;
      }
      if (recurrenceType) {
        eventPayload.recurrenceType = recurrenceType;
        if (recurrenceType == 'none') {
          eventPayload.startDate = date.start;
          if (new Date(date.start) < new Date(date.end)) {
            eventPayload.endDate = date.end;
          } else {
            throw new Error('Invalid date range');
          }
        } else if (recurrenceType == 'weekly') {
          let startDate =
            date.start.indexOf('T') > -1
              ? date.start.split('T')[1]?.slice(0, 5)
              : date.start;
          let endDate =
            date.end.indexOf('T') > -1
              ? date.end.split('T')[1]?.slice(0, 5)
              : date.end;
          const weekday = date.weekday;
          startDate = this.getNextDateWithWeekday({start: startDate, weekday});

          const _e = endDate;
          endDate = new Date(startDate);
          endDate.setHours(_e.split(':')[0], _e.split(':')[1], 0);
          if (
            Number(date.end.replaceAll(':', '')) <
            Number(date.start.replaceAll(':', ''))
          ) {
            endDate.setDate(endDate.getDate() + 1);
          }
          eventPayload.startDate = new Date(startDate);
          eventPayload.endDate = new Date(endDate);
        }
      }

      const eventRecord = await this.eventRepository.findById(
        id,
        EventManagerQueryFull,
      );

      if (eventPayload.recurrenceType) {
        const nextYearDate = new Date();
        nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
        this.eventService.createOrUpdateRecurringInstances(
          eventRecord,
          eventRecord.recurrenceType,
          nextYearDate,
        );
      }
      for (const key of Object.keys(eventPayload)) {
        if (eventPayload[key] !== eventRecord[key]) {
          eventUpdateRequired = true;
          break;
        }
      }
      if (
        eventPayload.placeId &&
        eventPayload.placeId !== eventRecord.placeId
      ) {
        const place = await this.placeRepository.findById(eventPayload.placeId);
        if (place) {
          eventPayload.addressId = place.addressId;
        }
      }
      if (eventUpdateRequired) {
        await this.eventRepository.updateById(id, eventPayload);
      }

      // Contacts
      const contactsPayload = contacts;
      const contactsRecord = await this.contactRepository.findOne({
        where: {refId: id},
        /*    include: [{relation: 'region'}], */
      });
      let contactsUpdateRequired = false;
      for (const key of Object.keys(contactsPayload || {})) {
        if (
          contactsRecord[key] !== contactsPayload[key] &&
          contactsPayload[key] !== null
        ) {
          contactsUpdateRequired = true;
          break;
        }
      }

      if (contactsUpdateRequired) {
        await this.contactRepository.updateById(
          contactsRecord.id,
          contactsPayload,
        );
      }

      // @TODO

      let playlistUpdateRequired = false;
      const playlistRecord = await this.playlistRepository.findById(
        eventRecord.playlistId,
      );
      const playlistPayload = {
        url: playlist?.url,
        name: playlist?.name,
        description: playlist?.description,
      };
      for (const key of Object.keys(playlistPayload)) {
        const original = (playlistRecord[key] || '')?.trim();
        const current = (playlistPayload[key] || '')?.trim();
        if (current && current?.length > 0) {
          if (original !== current) {
            playlistUpdateRequired = true;
          }
        }
      }
      if (playlistUpdateRequired) {
        await this.playlistRepository.updateById(
          eventRecord.playlistId,
          playlistPayload,
        );
      }

      return eventRecord;
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                                   BALCONY                                  */
  /* -------------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------------- */
  /*                                    TEAM                                    */
  /* -------------------------------------------------------------------------- */
  async findTeam(id: any) {
    return this.teamRepository.findById(id, {
      include: [
        {relation: 'cover'},
        {relation: 'staff', scope: {include: [{relation: 'user'}]}},
      ],
    });
  }
  async createTeam(body: any) {
    return this.executeManagerAction([], async () => {
      const keys = ['name', 'description', 'coverId'];
      const payload: any = {};
      for (const key of keys) {
        if (body?.[key] && body?.[key].trim().length > 0) {
          payload[key] = body[key].trim();
        }
      }
      payload.companyId = DEFAULT_MODEL_ID.companyId;
      if (!payload.coverId || payload.coverId == DEFAULT_MODEL_ID.coverId) {
        const company = await this.companyRepository.findById(
          payload.companyId,
        );
        payload.coverId = company.coverId;
      }
      const team = await this.teamRepository.create(payload);
      const staff = await this.staffRepository.findOne({
        where: {
          and: [
            {userId: this.currentUser.id},
            {role: 'admin'},
            {companyId: payload.companyId},
          ],
        },
      });
      await this.updateTeamStaff(team.id, staff.id, [], ['admin']);
      return this.findTeam(team.id);
    });
  }
  async updateTeam(id: any, body: any) {
    return this.executeManagerAction(
      [{repository: 'teamRepository', id}],
      async () => {
        //const team = await this.teamRepository.findById(id)
        const keys = ['name', 'description', 'coverId'];
        const payload: any = {};
        for (const key of keys) {
          if (body?.[key] && body?.[key].trim().length > 0) {
            payload[key] = body[key].trim();
          }
        }
        await this.teamRepository.updateById(id, payload);

        return this.findTeam(id);
      },
    );
  }

  async cloneTeamById(id: string) {
    return this.executeManagerAction(
      [{repository: 'teamRepository', id}],
      async () => {
        const team = await this.teamRepository.findById(id, {
          include: [{relation: 'staff'}],
        });

        const newTeamPayload = this.parseCloneObject(
          {...team, name: '[Cloned] ' + team.name},
          ['staff'],
        );
        const newTeam = await this.teamRepository.create(newTeamPayload);

        const newTeamStaffPayload = (team.staff || []).map(
          this.parseCloneObject,
        );

        for (const staff of newTeamStaffPayload) {
          await this.teamRepository.staff(newTeam.id).create(staff);
        }

        return this.teamRepository.findById(newTeam.id, {
          include: [{relation: 'staff'}],
        });
      },
    );
  }

  async deleteTeam(id: string) {
    return this.executeManagerAction(
      [{repository: 'teamRepository', id}],
      async () => this.teamRepository.deleteById(id),
    );
  }
  /**
   * @deprecated
   * @param id
   */
  async deleteTeamStaffBy(id: string) {}

  async updateTeamStaff(teamId, staffId, currentRoles, newRoles) {
    return this.executeManagerAction(
      [{repository: 'teamRepository', id: teamId}],
      async () => {
        const team = await this.teamRepository.findById(teamId);

        let staffUser = await this.staffRepository.findById(staffId);

        if (!staffUser) {
          const user = await this.userRepository.findById(staffId);
          if (!user) throw new Error('Invalid user');
          staffUser = await this.staffRepository.create({
            userId: staffId,
            role: newRoles[0],
            companyId: 'f0eeff9a-4a59-48b7-a1e4-17ddd608b145',
          });
          staffId = staffUser.id;
        }
        const userId = staffUser?.userId;
        const companyId = team?.companyId;

        for (const role of newRoles) {
          if (currentRoles.indexOf(role) == -1) {
            let staff = await this.staffRepository.findOne({
              where: {and: [{userId}, {role}]},
            });

            if (!staff) {
              staff = await this.staffRepository.create({
                userId,
                role,
                companyId,
              });
            }

            await this.teamStaffRepository.create({teamId, staffId: staff.id});
          }
        }
        for (const role of currentRoles) {
          if (newRoles.indexOf(role) == -1) {
            const staff = await this.staffRepository.findOne({
              where: {and: [{userId}, {role}]},
            });

            if (staff) {
              await this.teamStaffRepository.deleteAll({
                and: [{teamId}, {staffId: staff.id}],
              });
            }
          }
        }

        return this.findTeam(team.id);
      },
    );
  }

  async removeStaffFromTeam(teamId: string, staffId: string) {
    if (!teamId || !staffId) throw new Error('Missing required parameters');
    const result = await this.teamStaffRepository.findOne({
      where: {
        and: [{teamId: teamId}, {staffId: staffId}, {deleted: false}],
      },
    });

    if (result && result.teamId == teamId && result.staffId == staffId) {
      await this.teamStaffRepository.deleteById(result.id);
    }
    return {result};
  }

  /* -------------------------------------------------------------------------- */
  /*                                    CLONE                                   */
  /* -------------------------------------------------------------------------- */

  /* -------------------------------------------------------------------------- */
  /*                                   DELETE                                   */
  /* -------------------------------------------------------------------------- */

  /* -------------------------------------------------------------------------- */
  /*                                   HELPERS                                  */
  /* -------------------------------------------------------------------------- */

  private async executeManagerAction(validations: any = [], callback: any) {
    return this.transactionService.execute(async tx => {
      try {
        const companyId = this.currentUser.companyId;

        if (!companyId) {
          throw new HttpErrors.Unauthorized('Error verifying token.');
        }
        for (const validation of validations) {
          const record = await this[validation.repository].findById(
            validation.id,
          );

          if (companyId !== record.companyId) {
            throw new Error(`User doesn't own or manage the current company`);
          }
        }

        const response = await callback();

        return response;
      } catch (ex) {
        throw new HttpErrors.Unauthorized('Didnt meet company requirements');
      }
    });
  }

  private parseCloneObject(obj: any, additionalParameters: any = []) {
    delete obj.id;
    delete obj.created_at;
    delete obj.updated_at;
    if (Array.isArray(additionalParameters)) {
      for (const parameter of additionalParameters) {
        delete obj[parameter];
      }
    }
    return obj;
  }
}
