import {inject} from "@loopback/core";
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from "@loopback/repository";
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from "@loopback/rest";
import {
  EventCreateTransformer,
  EventFullQuery,
  EventsQuery,
  EventValidation,
} from "../blueprints/event.blueprint";
import {
  IncludeScheduleRangeRelation,
  ScheduleTypes,
} from "../blueprints/shared/schedule.include";
import {Event,EventInstance,Price} from "../models";
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
} from "../repositories";
import {EventService,QrFactoryService} from "../services";
import {transactionWrapper} from "../shared/database";

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
    @inject("services.QrFactoryService")
    protected qrFactoryService: QrFactoryService,
    @inject("services.EventService")
    protected eventService: EventService,
    @inject("repositories.EventInstanceRepository")
    public eventInstanceRepository: EventInstanceRepository,

    @repository(RecurringScheduleRepository)
    public recurringScheduleRepository: RecurringScheduleRepository
  ) {}

  /*
   // 1. Create an event (one-time or recurring)
   @post('/events', {
    responses: {
      '200': {
        description: 'Event model instance',
        content: {'application/json': {schema: getModelSchemaRef(Event)}},
      },
    },
  })
  async createEvent(@param.body() eventData: Event): Promise<Event> {
    // Create the event
    const event = await this.eventRepository.create(eventData);

    // If the event is recurring, create the schedule
    if (eventData.isRecurring) {
      // You may receive schedule information in the body of the request
      const scheduleData = eventData.recurringSchedule;
      if (scheduleData) {
        await this.eventRepository.schedule(event.id).create(scheduleData);
      }
    }

    return event;
  }

  // 2. Find all events (with event instances and schedules included)
  @get('/events', {
    responses: {
      '200': {
        description: 'Array of Event model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Event)},
          },
        },
      },
    },
  })
  async findAllEvents(): Promise<Event[]> {
    return this.eventRepository.find({
      include: [
        {relation: 'instances'}, // Include event instances (occurrences)
        {relation: 'schedule'}, // Include recurring schedules
      ],
    });
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
  async findUpcomingEvents(): Promise<EventInstance[]> {
    const currentDateTime = new Date().toISOString(); // Get current time
    return this.eventInstanceRepository.find({
      where: {
        startDate: {gt: currentDateTime}, // Events happening in the future
      },
      order: ['startDate ASC'], // Order by nearest future events
      limit: 10, // Return nearest 10 events (optional)
      include: [{relation: 'event'}], // Include event details
    });
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
    const currentDateTime = new Date().toISOString();
    return this.eventInstanceRepository.find({
      where: {
        and: [
          {startDate: {lte: currentDateTime}},
          {
            or: [{endDate: {gte: currentDateTime}}, {endDate: null}],
          },
        ],
      },
      order: ['startDate ASC'],
      include: [{relation: 'event'}],
    });
  }

  // 5. Create a new event instance for an event (for recurring events)
  @post('/events/{id}/instances', {
    responses: {
      '200': {
        description: 'Create an instance of an event',
        content: {'application/json': {schema: getModelSchemaRef(EventInstance)}},
      },
    },
  })
  async createEventInstance(
    @param.path.string('id') eventId: string,
    @param.body() eventInstanceData: EventInstance,
  ): Promise<EventInstance> {
    return this.eventRepository.instances(eventId).create(eventInstanceData);
  }
}

  async upComingEvents() {
    const currentDateTime = new Date().toISOString(); // Current date and time in ISO format

    const upcomingEvents = await this.eventInstanceRepository.find({
      where: {
        startDate: { gt: currentDateTime }, // Find events where startDate is greater than now
      },
      order: ["startDate ASC"], // Order by the nearest start date
      limit: 10, // Limit the result to the nearest 10 events (optional)
      include: [{ relation: "event" }], // Include the related event details
    });

    return upcomingEvents;
  }

  async findOngoingEvents() {
    const currentDateTime = new Date().toISOString();

    const ongoingEvents = await this.eventInstanceRepository.find({
      where: {
        and: [
          { startDate: { lte: currentDateTime } }, // Events that started before or at the current time
          {
            or: [
              { endDate: { gte: currentDateTime } }, // Ongoing event with an end date
              { endDate: null }, // Ongoing event with no end date (e.g., a single-day event)
            ],
          },
        ],
      },
      order: ["startDate ASC"],
      include: [{ relation: "event" }], // Include the related event details
    });

    return ongoingEvents;
  }

  async findOngoingAndUpcomingEvents() {
    const currentDateTime = new Date().toISOString();

    const events = await this.eventInstanceRepository.find({
      where: {
        or: [
          {
            and: [
              { startDate: { lte: currentDateTime } },
              {
                or: [{ endDate: { gte: currentDateTime } }, { endDate: null }],
              },
            ],
          },
          { startDate: { gt: currentDateTime } },
        ],
      },
      order: ["startDate ASC"],
      include: [{ relation: "event" }], // Include the related event details
    });

    return events;
  }
*/
  // @get('/events/qr/check-in')
  // async createCheckInQr(
  //   @param.query.string("id") id:string
  // ){
  //   return this.generateCheckInQrCode(id)
  // }
  @post("/create/event")
  @response(200, {
    description: "Event model instance",
    content: { "application/json": { schema: getModelSchemaRef(Event) } },
  })
  async createEvent(
    @requestBody({
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              startDate: { type: "string" },
              endDate: { type: "string" },
              recurrenceType: { type: "string" },
              recurrenceEndDate: { type: "string" },
              coverId: { type: "string" },
              tagIds: { type: "array" },
            },
            required: ["name", "startDate", "recurrenceType"],
          },
        },
      },
    })
    eventData: Partial<Event>
  ): Promise<Event> {
    return this.eventService.createEvent(eventData);
  }
  @patch("/update/event/{id}")
  @response(200, {
    description: "Event model instance",
    content: { "application/json": { schema: getModelSchemaRef(Event) } },
  })
  async updateEvent(
    @param.path.string("id") id: string,
    @requestBody({
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              startDate: { type: "string" },
              endDate: { type: "string" },
              coverId: { type: "string" },
              tagIds: { type: "array" },
              recurrenceType: { type: "string" },
              recurrenceEndDate: { type: "string" },
            },
            // required: ['name', 'startDate', 'recurrenceType'],
          },
        },
      },
    })
    eventData: Partial<Event>
  ): Promise<Event> {
    // console.log({ eventData, id });
    return this.eventService.edit(id, eventData);
  }

  // 3. Find nearest future events
  @get("/events/upcoming", {
    responses: {
      "200": {
        description: "Array of upcoming EventInstances",
        content: {
          "application/json": {
            schema: { type: "array", items: getModelSchemaRef(EventInstance) },
          },
        },
      },
    },
  })
  async findUpcomingEvents(): Promise<EventInstance[]> {

    return this.eventService.upcomming()
    // const currentDateTime = new Date().toISOString(); // Get current time
    // return this.eventInstanceRepository.find({
    //   where: {
    //     startDate: { gt: currentDateTime }, // Events happening in the future
    //   },
    //   order: ["startDate ASC"], // Order by nearest future events
    //   limit: 10, // Return nearest 10 events (optional)
    //   include: [{ relation: "event", scope:EventsQuery }], // Include event details
    // });
    // console.log('xxxxx')
    // const currentDateTime = new Date().toISOString();
    // let eventIds: any = [];
    // let keepRunning = true;
    // let records: any = [];
    // let i = 0;
    // while (keepRunning) {
    //   if(i >= 100)break;
    //   i++
    //   try {
    //     let record: any = await this.eventInstanceRepository.findOne({
    //       where: {

    //           startDate: { gte: currentDateTime },

    //           eventId: { nin: eventIds },


    //       },

    //       order: ["startDate ASC"],
    //       include: [
    //         {
    //           relation: "event",
    //           scope: {
    //             ...EventsQuery,
    //           },
    //         },
    //       ],
    //     });

    //     if (record) {
    //       record.event.startDate = record.startDate;
    //       record.event.endDate = record.endDate;
    //       records.push(record);
    //       eventIds.push(record.eventId);
    //     } else {
    //       keepRunning = false;
    //     }
    //   } catch (ex) {
    //     keepRunning = false;
    //   }
    // }
    // return records;
  }

  // 4. Find ongoing events
  @get("/events/ongoing", {
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
  async findOngoingEvents(): Promise<EventInstance[]> {
    const currentDateTime = new Date().toISOString();
    let eventIds: any = [];
    let keepRunning = true;
    let records: any = [];
    while (keepRunning) {
      let record: any = await this.eventInstanceRepository.findOne({
        where: {
          and: [
            {
              startDate: { lte: currentDateTime },
              endDate: { gte: currentDateTime },
              eventId: { nin: eventIds },
            },

            // {
            //   //@ts-ignore
            //   or: [{ endDate: { gte: currentDateTime } }, { endDate: null }],
            // },
          ],
        },

        order: ["startDate ASC"],
        include: [
          {
            relation: "event",
            scope: {
              ...EventsQuery,
            },
          },
        ],
      });
      console.log({ record, currentDateTime });
      if (record) {
        record.event.startDate = record.startDate;
        record.event.endDate = record.endDate;
        records.push(record);
        eventIds.push(record.eventId);
      } else {
        keepRunning = false;
      }
    }
    return records;
  }

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
  @get("/events/upcoming/nearby", {
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
  async findUpcomingNearbyEvents(): Promise<EventInstance[]> {
    return this.eventService.findUpcomingNearbyEvents(
      38.64239,
      -9.19569,
      100000000000000000
    );
  }

  // 5. Create a new event instance for an event (for recurring events)
  @post("/events/{id}/instances", {
    responses: {
      "200": {
        description: "Create an instance of an event",
        content: {
          "application/json": { schema: getModelSchemaRef(EventInstance) },
        },
      },
    },
  })
  async createEventInstance(
    @param.path.string("id") eventId: string,
    @requestBody({
      content: {
        "application/json": {
          exclude: ["id", "updated_at", "created_at"],
          schema: getModelSchemaRef(EventInstance, {
            title: "NewEvent",
            exclude: ["updated_at", "created_at"],
          }),
        },
      },
    })
    eventInstanceData: EventInstance
  ): Promise<EventInstance> {
    return this.eventRepository.instances(eventId).create(eventInstanceData);
  }

  @get("/events/nearby")
  async findNearbyPlaces(
    @param.query.number("lat") lat: number,
    @param.query.number("lon") lon: number
  ) {
    const results = await this.eventRepository.findByDistance(lat, lon);

    const _filter = {
      ...EventsQuery,
      where: {
        or: results.map((r: any) => {
          return { id: r.id };
        }),
      },
      sort: ["distance DESC"],
    };
    return this.eventRepository.find(_filter);
  }

  @get("/events/{id}/full")
  @response(200, {
    description: "Place model instance with all dependencies",
    content: {
      "application/json": {
        schema: getModelSchemaRef(Event, { includeRelations: true }),
      },
    },
  })
  async findByIdFull(
    @param.path.string("id") id: string,
    @param.filter(Event, { exclude: "where" })
    filter?: FilterExcludingWhere<Event>
  ): Promise<Event> {
    return this.eventRepository.findById(id, EventFullQuery);
  }

  @post("/events")
  @response(200, {
    description: "Event model instance",
    content: { "application/json": { schema: getModelSchemaRef(Event) } },
  })
  async create(
    @requestBody({
      content: {
        "application/json": {
          exclude: ["id", "updated_at", "created_at"],
          schema: getModelSchemaRef(Event, {
            title: "NewEvent",
            exclude: ["updated_at", "created_at"],
          }),
        },
      },
    })
    event: Omit<Event, "id">
  ): Promise<Event> {
    const response = await this.eventRepository.create(event);
    const entity = await this.eventRepository.findById(response.id);
    await this.updateScheduleData(entity);
    return response;
  }

  @post("/event")
  @response(200, {
    description: "Event model instance",
    content: { "application/json": { schema: getModelSchemaRef(Event) } },
  })
  async createFull(
    @requestBody({
      description: "Required input for login",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["name", "placeId"],
            properties: {
              name: {
                type: "string",
              },
              placeId: {
                type: "string",
              },
            },
          },
        },
      },
    })
    data: any
  ): Promise<Event> {
    const result = await transactionWrapper(
      this.eventRepository,
      async (transaction: any) => {


        const schedule = data?.schedule || { scheduleRange: [] };
        const payload = await EventCreateTransformer(data);

        const rules = data.rules || [];
        const tickets = data.tickets || [];
        const lineup = data.lineup || [];
        const contacts = data.contacts || {}
        // const schedule = data?.schedule || { scheduleRange: [] };

        delete payload.rules;
        delete payload.tickets;
        delete payload.tag;
        delete payload.lineup;
        delete payload.contacts;

        let playlist = await this.playlistRepository.create({
          name: "default playlist",
          description: "Add a description to your playlist",
          tagIds: [],
        });
        let scheduleRecord = await this.scheduleRepository.create({
          type: schedule?.type || "repeat",
        });

        const schedules = schedule.scheduleRange || [];
        for (let sr of schedules) {
          let startKey = "start";
          let endKey = "end";
          if (sr.start.datetime > sr.end.datetime) {
            startKey = "end";
            endKey = "start";
          }
          let startPayload = {
            datetime: sr[startKey].datetime,
            timezone: sr[startKey].timezone,
            weekDay: sr[startKey].weekDay,
            scheduleId: scheduleRecord.id,
          };
          let endPayload = {
            datetime: sr[endKey].datetime,
            timezone: sr[endKey].timezone,
            weekDay: sr[endKey].weekDay,
            scheduleId: scheduleRecord.id,
          };

          const scheduleStart = await this.datetimeRepository.create(
            startPayload
          );
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
          transaction
        );
        let entity:any = await this.eventRepository.findById(
          response.id,
          transaction
        );
        if (response.id) {
          await this.generateCheckInQrCode(response.id);
        }
        for (let ruleId of rules) {
          await this.eventRuleRepository.create(
            {
              eventId: entity.id,
              ruleId: ruleId,
              name: "01917710-0669-7a83-be5c-88ec7a599853",
              code: "01917710-0669-7a83-be5c-88ec7a599853",
              value: "01917710-0669-7a83-be5c-88ec7a599853",
            },
            transaction
          );
        }

        for (let ticket of tickets) {
          let price = ticket?.price?.price;
          if (price) {
            let priceRecordPayload: any = {
              where: {
                price,
                currencyId: "bc6635ea-7273-4518-b18a-c066fb300b1f",
              },
            };
            let priceRecord: Price | null = await this.priceRepository.findOne(
              priceRecordPayload
            );
            if (!priceRecord) {
              priceRecord = await this.priceRepository.create(
                priceRecordPayload.where,
                transaction
              );
            }
            if (priceRecord) {
              delete ticket.price;
              delete ticket.id;
              const ticketPayload = { ...ticket };
              ticketPayload.status = 1;
              ticketPayload.priceId = priceRecord.id;
              ticketPayload.refId = entity.id;
              await this.ticketRepository.create(ticketPayload, transaction);
            }
          }
        }
        await this.contactRepository.createRecord(entity.id, contacts)
        entity = await this.updateScheduleData(entity);
        entity = await EventValidation(this.eventRepository, entity);

        return entity;
      }
    );

    return result;
  }

  @patch("/events/{id}")
  @response(204, {
    description: "Event PATCH success",
  })
  async updateById(
    @param.path.string("id") id: string,
    @requestBody({
      description: "Required input for login",
      required: true,
      content: {
        // "application/json": {
        //   schema: {
        //     type: "object",
        //     properties: {
        //       name: {
        //         type: "string",
        //       },
        //       placeId: {
        //         type: "string",
        //       },
        //     },
        //   },
        // },
      },
    })
    data: any
  ): Promise<void> {
    const result = await transactionWrapper(
      this.eventRepository,
      async (transaction: any) => {
        const entity = await this.eventRepository.findById(id, EventFullQuery);
        const payload = await EventCreateTransformer({ ...entity, ...data });

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
          transaction
        );

        return response;
      }
    );

    return result;
  }

  @get("/events/count")
  @response(200, {
    description: "Event model count",
    content: { "application/json": { schema: CountSchema } },
  })
  async count(@param.where(Event) where?: Where<Event>): Promise<Count> {
    return this.eventRepository.count(where);
  }

  @get("/events")
  @response(200, {
    description: "Array of Event model instances",
    content: {
      "application/json": {
        schema: {
          type: "array",
          items: getModelSchemaRef(Event, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(Event) filter?: Filter<Event>): Promise<Event[]> {
    return this.eventRepository.find(EventsQuery);
  }

  @patch("/events")
  @response(200, {
    description: "Event PATCH success count",
    content: { "application/json": { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        "application/json": {
          exclude: ["id", "updated_at", "created_at"],
          schema: getModelSchemaRef(Event, { partial: true }),
        },
      },
    })
    event: Event,
    @param.where(Event) where?: Where<Event>
  ): Promise<Count> {
    return this.eventRepository.updateAll(event, where);
  }

  @get("/events/{id}")
  @response(200, {
    description: "Event model instance",
    content: {
      "application/json": {
        schema: getModelSchemaRef(Event, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.string("id") id: string,
    @param.filter(Event, { exclude: "where" })
    filter?: FilterExcludingWhere<Event>
  ): Promise<Event> {
    return this.eventRepository.findById(id, filter);
  }

  @put("/events/{id}")
  @response(204, {
    description: "Event PUT success",
  })
  async replaceById(
    @param.path.string("id") id: string,
    @requestBody() event: Event
  ): Promise<void> {
    const response = await this.eventRepository.replaceById(id, event);
    const entity = await this.eventRepository.findById(id);
    await this.updateScheduleData(entity);
    return response;
  }

  @del("/events/{id}")
  @response(204, {
    description: "Event DELETE success",
  })
  async deleteById(@param.path.string("id") id: string): Promise<void> {
    await this.eventRepository.deleteById(id);
  }

  private async updateScheduleData(entity: any) {
    if (entity?.scheduleId) {
      const schedule = await this.scheduleRepository.findById(
        entity.scheduleId,
        {
          include: [IncludeScheduleRangeRelation],
        }
      );
      if (schedule.type == ScheduleTypes[0]) {
        const ends: any[] = [new Date("1900-01-01 ")];
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
        action: "check-in",
        type: "event",
        id: refId,
      },
      refId,
      "check-in"
    );
    return qrRecord;
  }
}
