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
import {Event,Price} from "../models";
import {
  EventRepository,
  EventRuleRepository,
  PriceRepository,
  ScheduleRepository,
  TicketRepository,
} from "../repositories";
import {transactionWrapper} from "../shared/database";

export class EventController {
  constructor(
    @repository(EventRepository)
    public eventRepository: EventRepository,
    @repository(ScheduleRepository)
    public scheduleRepository: ScheduleRepository,
    @repository(TicketRepository)
    public ticketRepository: TicketRepository,
    @repository(PriceRepository)
    public priceRepository: PriceRepository,
    @repository(EventRuleRepository)
    public eventRuleRepository: EventRuleRepository
  ) {}

  @get("/events/nearby")
  async findNearbyPlaces(
    @param.query.number("lat") lat: number,
    @param.query.number("lon") lon: number
  ) {
    const results = await this.eventRepository.findByDistance(lat, lon);
    // console.log(results)
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
    console.log({ EventFullQuery: JSON.stringify(EventFullQuery) });
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
    console.log(event, {
      content: {
        "application/json": {
          exclude: ["id", "updated_at", "created_at"],
          schema: JSON.stringify(
            getModelSchemaRef(Event, {
              title: "NewEvent",
              exclude: ["updated_at", "created_at"],
            })
          ),
        },
      },
    });

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
    console.log("");
    console.log("");
    console.log("");
    console.log("");
    console.log("");
    console.log("");
    console.log("");
    console.log("");
    console.log("");
    // @todo create schedule
    console.log(data, {
      content: {
        "application/json": {
          exclude: ["id", "updated_at", "created_at"],
          schema: JSON.stringify(
            getModelSchemaRef(Event, {
              title: "NewEvent",
              exclude: ["updated_at", "created_at"],
            })
          ),
        },
      },
    });

    const result = await transactionWrapper(
      this.eventRepository,
      async (transaction: any) => {
        const payload = await EventCreateTransformer(data);
        const rules = data.rules || [];
        const tickets = data.tickets || [];
        const schedule = data?.schedule;

        delete payload.rules;
        delete payload.tickets;
        delete payload.tag;

        const response = await this.eventRepository.create(
          payload,
          transaction
        );
        let entity = await this.eventRepository.findById(
          response.id,
          transaction
        );

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

        entity =await this.updateScheduleData(entity);
        entity = await EventValidation(this.eventRepository, entity);

        return entity;
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

  @patch("/events/{id}")
  @response(204, {
    description: "Event PATCH success",
  })
  async updateById(
    @param.path.string("id") id: string,
    @requestBody({
      content: {
        "application/json": {
          exclude: ["id", "updated_at", "created_at"],
          schema: getModelSchemaRef(Event, { partial: true }),
        },
      },
    })
    event: Event
  ): Promise<void> {
    const response = await this.eventRepository.updateById(id, event);
    const entity = await this.eventRepository.findById(id);
    await this.updateScheduleData(entity);
    return response;
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
}
