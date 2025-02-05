// Uncomment these imports to begin using these cool features!

import {
  get,
  getModelSchemaRef,
  param,
  patch,
  requestBody,
  response,
} from '@loopback/rest';

import {intercept} from '@loopback/core';
import {FilterExcludingWhere, repository} from '@loopback/repository';
import {BalconyFullQuery} from '../../blueprints/balcony.blueprint';
import {EventFullQuery} from '../../blueprints/event.blueprint';
import {PlaceQueryFull} from '../../blueprints/place.blueprint';
import {IncludeIngredientRelation} from '../../blueprints/shared/ingredient.include';
import {OrderSingleFull} from '../../blueprints/shared/order.include';
import {Balcony, Stock} from '../../models/v1';
import {
  ActivityRepository,
  BalconyRepository,
  CompanyRepository,
  EventInstanceRepository,
  EventRepository,
  OrderRepository,
  PlaceRepository,
  StaffRepository,
  StockRepository,
  TeamRepository,
  TeamStaffRepository,
} from '../../repositories/v1';

// import {inject} from '@loopback/core';

export class BarController {
  constructor(
    @repository(TeamRepository)
    public teamRepository: TeamRepository,
    @repository(CompanyRepository)
    public companyRepository: CompanyRepository,
    @repository(TeamStaffRepository)
    public teamStaffRepository: TeamStaffRepository,
    @repository(EventRepository)
    public eventRepository: EventRepository,
    @repository(EventInstanceRepository)
    public eventInstanceRepository: EventInstanceRepository,
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
    @repository(ActivityRepository)
    public activityRepository: ActivityRepository,
    @repository(BalconyRepository)
    public balconyRepository: BalconyRepository,
    @repository(StaffRepository)
    public staffRepository: StaffRepository,
    @repository(StockRepository)
    public stockRepository: StockRepository,
  ) {}

  @get('/bar/check-in-options')
  @intercept('services.ACL')
  @response(200, {
    description: 'TeamStaff DELETE success',
  })
  async getCheckInOptions(payload: any = {}): Promise<any> {
    const userAccess = payload?.__userAccess;
    const barTeams: any = userAccess?.roles?.bar?.teams || [];

    const events = await this.eventRepository.findAll({
      ...EventFullQuery,
      where: {teamId: {inq: barTeams}},
    });
    const places = await this.placeRepository.findAll({
      ...PlaceQueryFull,
      where: {id: {inq: [...new Set(events.map(e => e.placeId))]}},
    });

    return {
      teams: userAccess.teams,
      events: events,
      places: places.map((place: any) => {
        return {
          ...place,
          events: [
            ...[...events.filter(event => event.placeId == place.id)].map(
              event => {
                return {
                  ...event,
                  team: userAccess.teams[event.teamId],
                };
              },
            ),
          ],
          teams: place?.events?.map((event: any) => {
            return {id: event.teamId, ...userAccess.teams[event.teamId]};
          }),
        };
      }),
    };
  }

  @get('/bar/balcony/{id}/menu')
  async findMenuByBalconyId(
    @param.path.string('id') id: string,
    @param.filter(Balcony, {exclude: 'where'})
    filter?: FilterExcludingWhere<Balcony>,
  ): Promise<Balcony> {
    return this.balconyRepository.findById(id, BalconyFullQuery);
  }
  @get('/bar/balcony/{id}/stock')
  async findStockByBalconyId(
    @param.path.string('id') id: string,
    @param.filter(Balcony, {exclude: 'where'})
    filter?: FilterExcludingWhere<Balcony>,
  ): Promise<any> {
    const balcony: any = await this.balconyRepository.findById(
      id,
      BalconyFullQuery,
    ); //{include:[{relation:"meny"}])
    const stock: any = await this.stockRepository.findAll({
      where: {balconyId: id},
      include: [IncludeIngredientRelation],
    }); //BalconyFullQuery);

    return {balcony, stock};
  }

  @patch('/bar/balcony/stock/{id}')
  @response(204, {
    description: 'Balcony PATCH success',
  })
  async updateStockById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          exclude: ['id', 'updated_at', 'created_at'],
          schema: getModelSchemaRef(Stock, {partial: true}),
        },
      },
    })
    stock: Stock,
  ): Promise<void> {
    await this.stockRepository.updateById(id, {status: stock.status});
  }

  @get('/bar/balcony/{id}/orders')
  @intercept('services.ACL')
  @response(200, {
    description: 'TeamStaff DELETE success',
  })
  async getCurrentBalconyOrders(
    @param.path.string('id') id: string,
    payload: any = {},
  ): Promise<any> {
    // Step #1
    //// Validar acesso ao bar
    //// Bar belongs to place

    const barAccessPayload: any = {
      userId: payload?.__userAccess?.user?.id,
      action: {inq: ['check-in', 'check-out']},
      job: 'BAR',
      role: 'staff',
    };

    const barAccess = await this.activityRepository.findOne({
      where: barAccessPayload,
      order: ['created_at DESC'],
    });

    let hasAccess = false;
    const eventId: any = barAccess?.eventId;
    const placeId: any = barAccess?.placeId;
    const orders: any = [];
    const now: any = new Date();
    let startDate: any = false;

    if (
      barAccess?.balconyId == id &&
      barAccess?.complete == false &&
      barAccess?.action == 'check-in'
    ) {
      hasAccess = true;

      if (eventId) {
        const instance = await this.eventInstanceRepository.findOne({
          where: {
            eventId,
            startDate: {lte: now},
            endDate: {gte: now},
          },
        });
        if (instance) {
          startDate = new Date(instance.startDate);
        }
      }
      if (!startDate) {
        const openHours: any =
          await this.placeRepository.getTodayOpeningHours(placeId);
        const openhour = openHours?.[0].openhour;
        const dayofweek = openHours?.[0].dayofweek;
        const now = new Date();
        startDate = now;
        if (startDate.getDay() > dayofweek)
          startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(openhour.split(':')[0]);
        startDate.setMinutes(openhour.split(':')[1]);
        startDate.setSeconds(0);
        startDate.setMilliseconds(0);
      }
      return this.orderRepository.findAll({
        ...OrderSingleFull,
        where: {
          and: [
            {balconyId: id},
            {created_at: {gte: startDate}},
            {deleted: false},
          ],
        },
        order: 'created_at DESC',
      });
    } else {
      throw 'Access denied';
    }
  }
}
