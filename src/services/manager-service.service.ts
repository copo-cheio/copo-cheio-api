import {AuthenticationBindings} from '@loopback/authentication';
import {/* inject, */ BindingScope, inject, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {UserProfile} from '@loopback/security';
import {BalconyFullQuery} from '../blueprints/balcony.blueprint';
import {MenuFullQuery} from '../blueprints/menu.blueprint';
import {PlaceManagerQueryFull} from '../blueprints/place.blueprint';
import {QueryFilterBaseBlueprint} from '../blueprints/shared/query-filter.interface';
import {DEFAULT_MODEL_ID} from '../constants';
import {
  AddressRepository,
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
  RegionRepository,
  StaffRepository,
  StockRepository,
  TeamRepository,
  TeamStaffRepository,
  UserRepository,
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
    @repository('AddressRepository')
    public addressRepository: AddressRepository,
    @repository('RegionRepository')
    public regionRepository: RegionRepository,
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
    @repository('TeamRepository')
    public teamRepository: TeamRepository,
    @repository('TeamStaffRepository')
    public teamStaffRepository: TeamStaffRepository,
    @repository('StaffRepository')
    public staffRepository: StaffRepository,
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
  async getPlacePage(id: string) {
    return this.placeRepository.findById(id, PlaceManagerQueryFull);
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
      const team = await this.teamRepository.create({
        name: name + 'team',
        companyId: company.id,
        coverId: coverId,
      });
      const teamStaff = await this.updateTeamStaff(
        team.id,
        this.currentUser.id,
        [],
        ['admin'],
      );

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

  async createPlace(payload: any = {}) {
    // Precisa de teamId
    // Precisa de address
    // Precisa de opening hours
    // Precisa de companyId
    // Precisa de contactsId
    // Precisa de tagIds
    // Precisa de playlistId
    // @TODO Falta address e playlist que n tou com coragem agr
    return payload;
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
        console.log('Will update contacts', {contactsRecord, contactsPayload});
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
      console.log({addressUpdateRequired, addressPayload});
      if (addressUpdateRequired) {
        console.log('Will update address');
        addressPayload.long_label = [
          address.address,
          regionRecord?.name,
          address.postal,
        ].join(',');
        console.log({addressPayload, addressRecord});
        await this.addressRepository.updateById(
          addressRecord.id,
          addressPayload,
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

  async updateTeamStaff(teamId, staffId, currentRoles, newRoles) {
    return this.executeManagerAction(
      [{repository: 'teamRepository', teamId}],
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
            console.log({role});
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
      },
    );
  }
  /* -------------------------------------------------------------------------- */
  /*                                    CLONE                                   */
  /* -------------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------------- */
  /*                                   DELETE                                   */
  /* -------------------------------------------------------------------------- */

  async deleteTeam(id: string) {
    return this.executeManagerAction(
      [{repository: 'teamRepository', id}],
      async () => this.teamRepository.deleteById(id),
    );
  }
  async deleteTeamStaffBy(id: string) {
    /*   const team = await this.staffRepository.findById(id,{include:})
    return this.executeManagerAction(
      [{repository: 'teamRepository', id}],
      async () => this.teamRepository.deleteById(id),
    ); */
  }

  /* -------------------------------------------------------------------------- */
  /*                                   HELPERS                                  */
  /* -------------------------------------------------------------------------- */

  private async executeManagerAction(validations: any = [], callback: any) {
    return this.transactionService.execute(async tx => {
      const user = await this.staffRepository.findAll({
        where: {
          and: [
            {userId: this.currentUser.id},
            {role: {inq: ['manager', 'owner']}},
          ],
        },
      });
      const companyIds = user.map((u: any) => u.companyId);
      for (const validation of validations) {
        const record = await this[validation.repository].findById(
          validation.id,
        );
        if (companyIds.indexOf(record.companyId) == -1) {
          throw new Error(`User doesn't own or manage the current company`);
        }
      }

      return callback();
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
