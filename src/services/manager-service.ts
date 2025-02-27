/* import {AuthenticationBindings} from '@loopback/authentication';
import {BindingScope, inject, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {UserProfile} from '@loopback/security';
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
  StaffRepository,
  StockRepository,
  TeamRepository,
} from '../repositories';
import {PlaceInstanceRepository} from '../repositories/v1/place-instance.repository';
import {EventService} from './event.service';
import {PlaceService} from './place.service';
import {ProductService} from './product.service';
import {StockService} from './stock-service.service';
import {TransactionService} from './transaction.service';

@injectable({scope: BindingScope.TRANSIENT})
export class ManagerServiceV2 {
  constructor(
    @inject('services.StockService') private stockService: StockService,
    @inject('services.ProductService') private productService: ProductService,
    @inject('services.PlaceService') private placeService: PlaceService,
    @inject('services.EventService') private eventService: EventService,
    @inject('services.TransactionService')
    private transactionService: TransactionService,
    @repository(MenuProductRepository)
    private menuProductRepository: MenuProductRepository,
    @repository(BalconyRepository) private balconyRepository: BalconyRepository,
    @repository(DevRepository) private devRepository: DevRepository,
    @repository(MenuRepository) private menuRepository: MenuRepository,
    @repository(PlaceRepository) private placeRepository: PlaceRepository,
    @repository(PlaceInstanceRepository)
    private placeInstanceRepository: PlaceInstanceRepository,
    @repository(EventInstanceRepository)
    private eventInstanceRepository: EventInstanceRepository,
    @repository(PriceRepository) private priceRepository: PriceRepository,
    @repository(OrderV2Repository) private orderV2Repository: OrderV2Repository,
    @repository(CompanyRepository) private companyRepository: CompanyRepository,
    @repository(ContactsRepository)
    private contactRepository: ContactsRepository,
    @repository(ProductRepository) private productRepository: ProductRepository,
    @repository(ProductOptionRepository)
    private productOptionRepository: ProductOptionRepository,
    @repository(IngredientRepository)
    private ingredientRepository: IngredientRepository,
    @repository(StockRepository) private stockRepository: StockRepository,
    @repository(TeamRepository) private teamRepository: TeamRepository,
    @repository(StaffRepository) private staffRepository: StaffRepository,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private currentUser?: UserProfile,
  ) {}

  async getHomePage() {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const [places, events, orders, stockStatus] = await Promise.all([
      this.placeService.getManagerPlacesWhichAreOrWillOpenToday(),
      this.eventService.getManagerEventsWhichAreOrWillOpenToday(),
      this.findOrders({
        limit: 100000,
        where: {created_at: {gte: oneDayAgo.toISOString()}},
      }),
      this.stockService.getManagerStockStatusOverview(),
    ]);

    const totalRevenue = orders.reduce(
      (sum, order) => sum + parseFloat(order.details?.totalPrice || '0'),
      0,
    );
    const averagePrice = orders.length
      ? (totalRevenue / orders.length).toFixed(2)
      : '0.00';

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
        stocks: {...stockStatus},
      },
      totalRevenue,
      orders: orders.length,
    };
  }

  async findOrders(filters: any = {}) {
    const where = {
      status: {neq: 'WAITING_PAYMENT'},
      ...filters?.where,
    };

    return this.orderV2Repository.findAll({
      where,
      limit: filters?.limit || 100,
      order: ['created_at DESC'],
      include: [{relation: 'details'}, {relation: 'place'}],
    });
  }

  async createCompany(payload: any) {
    const {name, description, coverId, contacts} = payload;

    return this.transactionService.execute(async tx => {
      const company = await this.companyRepository.create({
        name,
        description,
        coverId,
      });
      const contact = await this.contactRepository.create({
        refId: company.id,
        ...contacts,
      });
      return {...company, contact};
    });
  }

  async updateCompany(id: string, payload: any) {
    const {name, description, coverId, contacts} = payload;

    return this.transactionService.execute(async tx => {
      const company = await this.companyRepository.findById(id);
      const contact = await this.contactRepository.findOne({
        where: {refId: id, deleted: false},
      });

      await this.companyRepository.updateById(id, {name, description, coverId});
      if (contact)
        await this.contactRepository.updateById(contact.id, contacts);

      return {...company, contact};
    });
  }

  async createProduct(payload: any) {
    const {
      name,
      description,
      thumbnailId,
      tagIds,
      ingredientIds,
      optionIngredientIds,
    } = payload;

    return this.transactionService.execute(async tx => {
      return this.productService.create({
        name,
        description,
        thumbnailId,
        tagIds,
        ingredients: ingredientIds.map(id => ({id})),
        options: optionIngredientIds.map(id => ({id})),
      });
    });
  }

  async updateProductById(id: string, payload: any) {
    return this.transactionService.execute(async tx => {
      return this.productService.updateProduct(id, {
        ...payload,
        ingredients: payload.ingredientIds.map((id: any) => ({id})),
        options: payload.optionIngredientIds.map((id: any) => ({id})),
      });
    });
  }
}
 */
