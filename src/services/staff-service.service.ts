import {/* inject, */ BindingScope, injectable} from '@loopback/core';

import {AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {UserProfile} from '@loopback/security';
import {EventsQuery} from '../blueprints/event.blueprint';
import {PlacesQuery} from '../blueprints/place.blueprint';
import {
  ActivityV2Repository,
  BalconyQueries,
  BalconyRepository,
  BalconyTransformers,
  CheckInV2Repository,
  DevRepository,
  EventRepository,
  OrderV2Queries,
  OrderV2Repository,
  OrderV2Transformers,
  PlaceRepository,
  StockRepository,
} from '../repositories';
import {AuthService, OrderService, PushNotificationService} from '../services';
import {PlaceService} from './place.service';
@injectable({scope: BindingScope.TRANSIENT})
export class StaffService {
  constructor(
    @repository('DevRepository') public devRepository: DevRepository,
    @repository('StockRepository') public stockRepository: StockRepository,
    @repository('BalconyRepository')
    public balconyRepository: BalconyRepository,
    @repository('CheckInV2Repository')
    public checkInV2Repository: CheckInV2Repository,
    @repository('OrderV2Repository')
    public orderV2Repository: OrderV2Repository,
    @inject('services.AuthService')
    protected authService: AuthService,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private currentUser: UserProfile, // Inject the current user profile
    @inject('services.PlaceService')
    protected placeService: PlaceService,
    @inject('services.OrderService')
    protected orderService: OrderService,
    @inject('services.PushNotificationService')
    private pushNotificationService: PushNotificationService,
    @repository('ActivityV2Repository')
    public activityV2Repository: ActivityV2Repository,
    @repository('PlaceRepository') public placeRepository: PlaceRepository,
    @repository('EventRepository') public eventRepository: EventRepository,
  ) {
    //  @repository(DevRepository) public devRepository: DevRepository
  }

  /**
   * PERMISSÕES
   * 1. actualizar estado de pedidos nos balcões onde está actualmente checkinado e apenas durante a sessão actual
   * 2. validar códigos qr dos pedidos nos balcões onde está actualmente checkinado
   * 3. listar pedidos dos balcões onde está actualmente checkinado
   * 4. actualizar estado de stock de um ingrediente -> por consequencia irá afectar todo o menú desse balcão
   *
   * NOTIFICAÇÕES
   * 1. novo pedido no balcão
   * 2. balcão actualizado ( apenas quando algo entra em ongoing )
   */
  /**
   * Will update a ingredient status on a balcony
   * Afterwards will lock or unlock products and their respective orders
   * Notifies the admins
   * Notifies all the checked in users in that place to refresh the menu
   */

  /* -------------------------------------------------------------------------- */
  /*                                     V2                                     */
  /* -------------------------------------------------------------------------- */

  async getPageActivityPlaces() {
    const activity = await this.activityV2Repository.findAll({
      where: {
        and: [
          {userId: this.currentUser.id},
          {action: 'check-in--place'},
          {app: 'staff'},
        ],
      },
    });
    const places = await this.placeRepository.findAll({
      ...PlacesQuery,
      where: {id: {inq: [...new Set(activity.map(a => a.referenceId))]}},
    });

    return {
      places,
      activity,
    };
  }
  async getPageActivityEvents() {
    const activity = await this.activityV2Repository.findAll({
      where: {
        and: [
          {userId: this.currentUser.id},
          {action: 'check-in--event'},
          {app: 'staff'},
        ],
      },
    });
    const events = await this.eventRepository.findAll({
      ...EventsQuery,
      where: {id: {inq: [...new Set(activity.map(a => a.referenceId))]}},
    });

    return {
      events,
      activity,
    };
  }
  /*
  const response: any = {
    success: false,
    };
    const systemOrder = await this.findByIdInList(
    () => this.findByAction('system', 'orders', 'system'),
    refId,
    'orderId',
  );

  if (systemOrder.item.status == 'READY') {
    const code = systemOrder.item.code;
    const decription = await this.encriptionService.comparePassword(
      data.code,
      code,
    );
    if (decription) {
      await this.updateOrder('staff', refId, {
        status: 'COMPLETE',
        staffId: data.staffId,
      });
      await this.updateSystemOrderStatusByOrderId(refId, 'COMPLETE');
      response.success = true;
    }
    response.order = await this.getOrder(refId);

    return response;
    */
  async validateOrderV2(payload: any = {}) {
    return this.orderService.validateOrderV2(payload);
  }
  async getStaffOrdersPage() {
    const checkIn = await this.checkInV2Repository.findStaffCheckIn(
      this.currentUser.id,
    );
    const balconyId = checkIn?.balconyId;
    const balconyOrders = await this.balconyRepository.findById(
      balconyId,
      BalconyQueries.staffCheckInOrdersPage(checkIn.placeInstanceId),
    );
    return BalconyTransformers.staffOrdersWithMap(balconyOrders);
  }
  async getStaffOrderPage(id: string) {
    const order = await this.orderV2Repository.findById(
      id,
      OrderV2Queries.full,
    );
    return OrderV2Transformers.full(order);
  }

  /* -------------------------------------------------------------------------- */
  /*                                     V1                                     */
  /* -------------------------------------------------------------------------- */

  async updateOrderStatus({orderId, status}) {
    return this.orderService.onUpdateOrderV2(orderId, status);
  }

  /**
   * Will update a ingredient status on a balcony
   * Afterwards will lock or unlock products and their respective orders
   * Notifies the admins
   * Notifies all the checked in users in that place to refresh the menu
   */
  async updateStockStatus(stockId, status) {
    const staff = await this.getActiveStaffInfo();
    const stock = await this.stockRepository.updateById(stockId, {
      status: status,
    });

    await this.notifyCheckedInUsersOnStockUpdate(staff.placeId);
    return this.stockRepository.findById(stockId);
  }

  async notifyCheckedInUsersOnStockUpdate(placeId) {
    const checkedInUsers = await this.getCheckedInUsers(placeId);
    const notificationTokens = [
      ...new Set(
        checkedInUsers
          .map(cu => cu.data.pushNotificationToken)
          .filter(token => (token ? true : false)),
      ),
    ];
    await this.notify(
      notificationTokens,
      'stock change',
      'stock change in place',
      {action: 'STOCK_UPDATE', payload: {placeId}},
    );
  }

  async notify(tokens: any, title, body, data) {
    if (!Array.isArray(tokens)) tokens = [tokens];
    for (const token of tokens) {
      try {
        const notification = {
          title: title,
          body: body,
        };

        await this.pushNotificationService.sendPushNotification(
          token,
          notification,
          data,
        );
      } catch (ex) {
        console.log(ex);
      }
    }
  }

  async getCheckedInUsers(placeId: any = {}) {
    const checkedInUsers = await this.devRepository.findAll({
      where: {and: [{app: 'user', action: 'check-in'}]},
    });
    const allUsers: any = checkedInUsers.filter(
      user => user.data.placeId == placeId && user.data.active,
    );
    const notificationUsers = await this.devRepository.findAll({
      where: {
        and: [
          {action: 'sign-in'},
          {app: 'user'},
          {
            refId: {
              inq: [allUsers.map((au: any) => au.data.uid)],
            },
          },
        ],
      },
    });

    return notificationUsers;
  }

  /**
   * Will validate a que code and check if it is valid or not
   * If it's delivered or not
   * if it's on the right balcony
   *
   * Notifies balcony and user ( silent notification )
   *
   */
  async validateBalconyOrder() {}

  /**
   * Gets 4 orders list:
   * ONHOLD  -> from older to newer
   * ONGOING -> processed by this user ->older to newer
   * READY   -> processed by this user -> newer to older
   * COMPLETE-> processed at any given time by this user -> newer to older
   */
  private staffVisibleOrderStatus = ['ONHOLD', 'ONGOING', 'READY', 'COMPLETE'];
  async getBalconyOrders() {
    const staff = await this.getActiveStaffInfo();
    const timeSpan = await this.getSessionTimeSpan(staff.placeId);
    console.log({staff, timeSpan});
    const balconyOrdersRecord = await this.devRepository.findOne({
      where: {
        and: [{app: 'staff', refId: staff.balconyId, action: 'balcony-orders'}],
      },
    });
    const balconyOrders = balconyOrdersRecord.data.filter(
      (balconyOrder: any = {}) =>
        new Date(balconyOrder.created_at) >= new Date(timeSpan.start) &&
        this.staffVisibleOrderStatus.indexOf(balconyOrder.status) > -1,
    );
    const balconyOrderMap: any = {
      ONHOLD: [],
      ONGOING: [],
      READY: [],
      COMPLETE: [],
    };

    for (const balconyOrder of balconyOrders) {
      const status = balconyOrder.status;
      balconyOrderMap[status].push(balconyOrder);
    }

    balconyOrderMap.ONGOING = balconyOrderMap.ONGOING.filter(
      balconyOrder => balconyOrder?.timeline?.[1]?.staffId == staff.staffId,
    );
    balconyOrderMap.COMPLETE = balconyOrderMap.COMPLETE.filter(
      balconyOrder =>
        [
          balconyOrder?.timeline?.[1]?.staffId,
          balconyOrder?.timeline?.[3]?.staffId,
        ].indexOf(staff.staffId) > -1,
    );

    const response = {
      balconyOrders,
      balconyOrderMap,
    };

    return response;
  }

  /**
   * Get's current check in start and closing hour
   * All orders will be fetched between that timespan
   */
  async getSessionTimeSpan(placeId: string) {
    const openingHours = await this.placeService.getTodayActiveHours(placeId);

    return {
      ...openingHours,
    };
  }

  async getActiveStaffInfo() {
    const staff = await this.getUserDetails();
    if (!staff?.checkIn?.active) {
      throw new Error('User not checked in');
    }

    return {
      staffId: staff.user.uid,
      staff: staff.user,
      balconyId: staff.checkIn.balconyId,
      placeId: staff.checkIn.placeId,
      role: staff.checkIn.role,
    };
  }
  async getUserDetails() {
    // Fetches the logged-in user
    const user = this.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const checkIn = await this.devRepository.findByAction(
      'staff',
      'check-in',
      user.uid,
    );

    return {user, checkIn: checkIn.data}; // This contains details like id, name, roles, etc.
  }
}
