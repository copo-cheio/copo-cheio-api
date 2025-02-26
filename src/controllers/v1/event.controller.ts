import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject, intercept} from '@loopback/core';
import {Filter, FilterExcludingWhere, repository} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  Request,
  requestBody,
  response,
  RestBindings,
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {
  EventCreateTransformer,
  EventFullQuery,
  EventsQuery,
  EventValidation,
} from '../../blueprints/event.blueprint';
import {
  IncludeScheduleRangeRelation,
  ScheduleTypes,
} from '../../blueprints/shared/schedule.include';
import {addCompanyOwnership} from '../../interceptors/add-company-ownership.interceptor';
import {Event, EventInstance, Price} from '../../models';
import {
  ContactsRepository,
  DateTimeRepository,
  EventInstanceRepository,
  EventRepository,
  EventRuleRepository,
  PlaylistRepository,
  PriceRepository,
  RecurringScheduleRepository,
  ScheduleRangeRepository,
  ScheduleRepository,
  TicketRepository,
} from '../../repositories';
import {EventService, QrFactoryService} from '../../services';
import {transactionWrapper} from '../../shared/database';

export class EventController {
  constructor(
    @repository(EventRepository)
    public eventRepository: EventRepository,
    @repository(ContactsRepository)
    public contactRepository: ContactsRepository,
    @repository(ScheduleRepository)
    public scheduleRepository: ScheduleRepository,
    @repository(ScheduleRangeRepository)
    public scheduleRangeRepository: ScheduleRangeRepository,
    @repository(TicketRepository)
    public ticketRepository: TicketRepository,
    @repository(PriceRepository)
    public priceRepository: PriceRepository,
    @repository(EventRuleRepository)
    public eventRuleRepository: EventRuleRepository,
    @repository(PlaylistRepository)
    public playlistRepository: PlaylistRepository,
    @repository(DateTimeRepository)
    public datetimeRepository: DateTimeRepository,
    @inject('services.QrFactoryService')
    protected qrFactoryService: QrFactoryService,
    @inject('services.EventService')
    protected eventService: EventService,
    @inject('repositories.EventInstanceRepository')
    public eventInstanceRepository: EventInstanceRepository,

    @repository(RecurringScheduleRepository)
    public recurringScheduleRepository: RecurringScheduleRepository,
    @inject(RestBindings.Http.REQUEST) private request: Request,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    public currentUser: UserProfile, // Inject the current user profile
  ) {
    console.log(AuthenticationBindings.CURRENT_USER);
  }

  @post('/create/event')
  @response(200, {
    description: 'Event model instance',
    content: {'application/json': {schema: getModelSchemaRef(Event)}},
  })
  async createEvent(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: {type: 'string'},
              description: {type: 'string'},
              startDate: {type: 'string'},
              endDate: {type: 'string'},
              recurrenceType: {type: 'string'},
              recurrenceEndDate: {type: 'string'},
              coverId: {type: 'string'},
              tagIds: {type: 'array'},
            },
            required: ['name', 'startDate', 'recurrenceType'],
          },
        },
      },
    })
    eventData: Partial<Event>,
  ): Promise<Event> {
    return this.eventService.createEvent(eventData);
  }
  @patch('/update/event/{id}')
  @response(200, {
    description: 'Event model instance',
    content: {'application/json': {schema: getModelSchemaRef(Event)}},
  })
  async updateEvent(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: {type: 'string'},
              description: {type: 'string'},
              startDate: {type: 'string'},
              endDate: {type: 'string'},
              coverId: {type: 'string'},
              tagIds: {type: 'array'},
              recurrenceType: {type: 'string'},
              recurrenceEndDate: {type: 'string'},
            },
            // required: ['name', 'startDate', 'recurrenceType'],
          },
        },
      },
    })
    eventData: Partial<Event>,
  ): Promise<Event> {
    // console.log({ eventData, id });
    return this.eventService.edit(id, eventData);
  }

  // 3. Find nearest future events
  @get('/events/upcoming', {
    responses: {
      '200': {
        description: 'Array of upcoming EventInstances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(EventInstance)},
          },
        },
      },
    },
  })
  async findUpcomingEvents(): Promise<any[]> {
    return this.eventService.upcomming();
  }

  // 4. Find ongoing events
  @get('/events/ongoing', {
    responses: {
      '200': {
        description: 'Array of ongoing EventInstances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(EventInstance)},
          },
        },
      },
    },
  })
  async findOngoingEvents(): Promise<EventInstance[]> {
    const currentDateTime = new Date(); //.toISOString();
    const eventIds: any = [];
    let keepRunning = true;
    const records: any = [];
    while (keepRunning) {
      const record: any = await this.eventInstanceRepository.findOne({
        where: {
          and: [
            {
              startDate: {lte: currentDateTime},
              endDate: {gte: currentDateTime},
              eventId: {nin: eventIds},
            },

            // {
            //   //@ts-ignore
            //   or: [{ endDate: { gte: currentDateTime } }, { endDate: null }],
            // },
          ],
        },

        order: ['startDate ASC'],
        include: [
          {
            relation: 'event',
            scope: {
              ...EventsQuery,
            },
          },
        ],
      });

      if (record) {
        record.event.startDate = record.startDate;
        record.event.endDate = record.endDate;
        record.event.now = currentDateTime;
        records.push(record);
        eventIds.push(record.eventId);
      } else {
        keepRunning = false;
      }
    }
    return records;
  }

  /*
  @get("/events/raw", {
    responses: {
      "200": {
        description: "Array of ongoing EventInstances",
        content: {
          "application/json": {
            schema: { type: "array", items: getModelSchemaRef(EventInstance) },
          },
        },
      },
    },
  })

  async findRaw(@param.filter(Event) filter?: Filter<Event>): Promise<Event[]> {
    return this.eventRepository.find(filter);
  }
  */
  @get('/events/upcoming/nearby', {
    responses: {
      '200': {
        description: 'Array of ongoing EventInstances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(EventInstance)},
          },
        },
      },
    },
  })
  async findUpcomingNearbyEvents(
    @param.query.number('latitude') latitude: number = 38.64239,
    @param.query.number('longitude') longitude: number = -9.19569,
  ): Promise<EventInstance[]> {
    return this.eventService.findUpcomingNearbyEvents(
      latitude,
      longitude,
      100000000000000000,
    );
  }

  // 5. Create a new event instance for an event (for recurring events)
  @post('/events/{id}/instances', {
    responses: {
      '200': {
        description: 'Create an instance of an event',
        content: {
          'application/json': {schema: getModelSchemaRef(EventInstance)},
        },
      },
    },
  })
  async createEventInstance(
    @param.path.string('id') eventId: string,
    @requestBody({
      content: {
        'application/json': {
          exclude: ['id', 'updated_at', 'created_at'],
          schema: getModelSchemaRef(EventInstance, {
            title: 'NewEvent',
            exclude: ['updated_at', 'created_at'],
          }),
        },
      },
    })
    eventInstanceData: EventInstance,
  ): Promise<EventInstance> {
    return this.eventRepository.instances(eventId).create(eventInstanceData);
  }

  @get('/events/nearby')
  async findNearbyPlaces(
    @param.query.number('latitude') latitude: number,
    @param.query.number('longitude') longitude: number,
  ) {
    const results = await this.eventRepository.findByDistance(
      latitude,
      longitude,
    );

    const _filter = {
      ...EventsQuery,
      where: {
        or: results.map((r: any) => {
          return {id: r.id};
        }),
      },
      sort: ['distance DESC'],
    };
    return this.eventRepository.find(_filter);
  }

  @get('/events/{id}/full')
  @response(200, {
    description: 'Place model instance with all dependencies',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Event, {includeRelations: true}),
      },
    },
  })
  async findByIdFull(
    @param.path.string('id') id: string,
    @param.filter(Event, {exclude: 'where'})
    filter?: FilterExcludingWhere<Event>,
  ): Promise<Event> {
    return this.eventRepository.findById(id, EventFullQuery);
  }

  @post('/events')
  @response(200, {
    description: 'Event model instance',
    content: {'application/json': {schema: getModelSchemaRef(Event)}},
  })
  @intercept(addCompanyOwnership)
  async create(
    @requestBody({
      content: {
        'application/json': {
          exclude: ['id', 'updated_at', 'created_at'],
          schema: getModelSchemaRef(Event, {
            title: 'NewEvent',
            exclude: ['updated_at', 'created_at'],
          }),
        },
      },
    })
    event: Omit<Event, 'id'>,
  ): Promise<Event> {
    const response = await this.eventRepository.create(event);
    const entity = await this.eventRepository.findById(response.id);
    await this.updateScheduleData(entity);
    return response;
  }

  @post('/event')
  @response(200, {
    description: 'Event model instance',
    content: {'application/json': {schema: getModelSchemaRef(Event)}},
  })
  @intercept(addCompanyOwnership)
  async createFull(
    @requestBody({
      description: 'Required input for login',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['name', 'placeId'],
            properties: {
              name: {
                type: 'string',
              },
              placeId: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    data: any,
  ): Promise<Event> {
    const result = await transactionWrapper(
      this.eventRepository,
      async (transaction: any) => {
        const schedule = data?.schedule || {scheduleRange: []};
        const payload = await EventCreateTransformer(data);

        const rules = data.rules || [];
        const tickets = data.tickets || [];
        const lineup = data.lineup || [];
        const contacts = data.contacts || {};
        // const schedule = data?.schedule || { scheduleRange: [] };

        delete payload.rules;
        delete payload.tickets;
        delete payload.tag;
        delete payload.lineup;
        delete payload.contacts;

        const playlist = await this.playlistRepository.create({
          name: 'default playlist',
          description: 'Add a description to your playlist',
          tagIds: [],
        });
        const scheduleRecord = await this.scheduleRepository.create({
          type: schedule?.type || 'repeat',
        });

        const schedules = schedule.scheduleRange || [];
        for (const sr of schedules) {
          let startKey = 'start';
          let endKey = 'end';
          if (sr.start.datetime > sr.end.datetime) {
            startKey = 'end';
            endKey = 'start';
          }
          const startPayload = {
            datetime: sr[startKey].datetime,
            timezone: sr[startKey].timezone,
            weekDay: sr[startKey].weekDay,
            scheduleId: scheduleRecord.id,
          };
          const endPayload = {
            datetime: sr[endKey].datetime,
            timezone: sr[endKey].timezone,
            weekDay: sr[endKey].weekDay,
            scheduleId: scheduleRecord.id,
          };

          const scheduleStart =
            await this.datetimeRepository.create(startPayload);
          const scheduleEnd = await this.datetimeRepository.create(endPayload);
          await this.scheduleRangeRepository.create({
            startId: scheduleStart.id,
            endId: scheduleEnd.id,
            scheduleId: scheduleRecord.id,
            weekDay: startPayload.weekDay,
          });
        }

        payload.playlistId = playlist.id;
        payload.scheduleId = scheduleRecord.id;
        const response = await this.eventRepository.create(
          payload,
          transaction,
        );
        let entity: any = await this.eventRepository.findById(
          response.id,
          transaction,
        );
        if (response.id) {
          await this.generateCheckInQrCode(response.id);
        }
        for (const ruleId of rules) {
          await this.eventRuleRepository.create(
            {
              eventId: entity.id,
              ruleId: ruleId,
              name: '01917710-0669-7a83-be5c-88ec7a599853',
              code: '01917710-0669-7a83-be5c-88ec7a599853',
              value: '01917710-0669-7a83-be5c-88ec7a599853',
            },
            transaction,
          );
        }

        for (const ticket of tickets) {
          const price = ticket?.price?.price;
          if (price) {
            const priceRecordPayload: any = {
              where: {
                price,
                currencyId: 'bc6635ea-7273-4518-b18a-c066fb300b1f',
              },
            };
            let priceRecord: Price | null =
              await this.priceRepository.findOne(priceRecordPayload);
            if (!priceRecord) {
              priceRecord = await this.priceRepository.create(
                priceRecordPayload.where,
                transaction,
              );
            }
            if (priceRecord) {
              delete ticket.price;
              delete ticket.id;
              const ticketPayload = {...ticket};
              ticketPayload.status = 1;
              ticketPayload.priceId = priceRecord.id;
              ticketPayload.refId = entity.id;
              await this.ticketRepository.create(ticketPayload, transaction);
            }
          }
        }
        await this.contactRepository.createRecord(entity.id, contacts);
        entity = await this.updateScheduleData(entity);
        entity = await EventValidation(this.eventRepository, entity);

        return entity;
      },
    );

    return result;
  }

  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      description: 'Required input for login',
      required: true,
      content: {},
    })
    data: any,
  ): Promise<void> {
    const result = await transactionWrapper(
      this.eventRepository,
      async (transaction: any) => {
        const entity = await this.eventRepository.findById(id, EventFullQuery);
        const payload = await EventCreateTransformer({...entity, ...data});

        delete payload.rules;
        delete payload.tickets;
        delete payload.tag;
        delete payload.events;
        delete payload.scheduleId;
        delete payload.schedule;
        delete payload.playlistId;
        delete payload.playlist;
        delete payload.tag;
        delete payload.tags;
        delete payload.tagIds;
        delete payload.address;
        delete payload.lineup;
        const response = await this.eventRepository.updateById(
          id,
          {
            ...entity,
            ...payload,
          },
          transaction,
        );

        return response;
      },
    );

    return result;
  }

  @get('/events')
  @response(200, {
    description: 'Array of Event model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Event, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Event) filter?: Filter<Event>): Promise<Event[]> {
    return this.eventRepository.find(EventsQuery);
  }

  @get('/events/{id}')
  @response(200, {
    description: 'Event model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Event, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Event, {exclude: 'where'})
    filter?: FilterExcludingWhere<Event>,
  ): Promise<Event> {
    return this.eventRepository.findById(id, filter);
  }

  @del('/events/{id}')
  @response(204, {
    description: 'Event DELETE success',
  })
  @authenticate('firebase')
  // @intercept(validateDeleteAction)
  //@ts-ignore
  @intercept('interceptors.CompanyOwnershipValidation')
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    // await this.eventRepository.deleteById(id);
    return new Promise(res => {
      setTimeout(res, 1000);
    });
  }

  private async updateScheduleData(entity: any) {
    if (entity?.scheduleId) {
      const schedule = await this.scheduleRepository.findById(
        entity.scheduleId,
        {
          include: [IncludeScheduleRangeRelation],
        },
      );
      if (schedule.type == ScheduleTypes[0]) {
        const ends: any[] = [new Date('1900-01-01 ')];
        if (Array.isArray(schedule?.scheduleRanges)) {
          schedule.scheduleRanges.forEach((sr: any) => {
            if (sr?.end?.datetime) {
              ends.push(new Date(sr.end.datetime));
            }
          });
        }
        ends.sort((a, b) => b - a);

        entity.endDate = ends[0];
        await this.eventRepository.updateById(entity.id, entity);
      }
    }
    return entity;
  }

  /* ********************************** */
  /*               HELPERS              */
  /* ********************************** */
  async generateCheckInQrCode(refId: string) {
    const qrRecord = await this.qrFactoryService.generateAndUploadQrCode(
      {
        action: 'check-in',
        type: 'event',
        id: refId,
      },
      refId,
      'check-in',
    );
    return qrRecord;
  }
}
