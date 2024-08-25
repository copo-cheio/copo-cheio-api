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
import {EventFullQuery,EventsQuery} from "../blueprints/event.blueprint";
import {
  IncludeScheduleRangeRelation,
  ScheduleTypes,
} from "../blueprints/shared/schedule.include";
import {Event} from "../models";
import {EventRepository,ScheduleRepository} from "../repositories";

export class EventController {
  constructor(
    @repository(EventRepository)
    public eventRepository: EventRepository,
    @repository(ScheduleRepository)
    public scheduleRepository: ScheduleRepository
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
            exclude: [ "updated_at", "created_at"],
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
      content: {
        "application/json": {
          exclude: ["id", "updated_at", "created_at"],
          schema: getModelSchemaRef(Event, {
            title: "NewEvent",
            exclude: [ "updated_at", "created_at"],
          }),
        },
      },
    })
    event: any
  ): Promise<Event> {

    const data = event.event;
    const cover = event.cover;
    const schedule = event.schedule;
    const tags = event.tags;
    const address = event.address;
    const playlist = event.playlist;
    const rules = event.rules;
    const tickets = event.tickets;
    const lineup = event.lineup;

    const response = await this.eventRepository.create(event);
    const entity = await this.eventRepository.findById(response.id);
    await this.updateScheduleData(entity);
    return response;
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
        const ends: any[] = [new Date("1900-01-01")];
        if (Array.isArray(schedule?.scheduleRanges)) {
          schedule.scheduleRanges.forEach((sr: any) => {
            if (sr?.end?.datetime) {
              ends.push(new Date(sr.end.datetime));
            }
          });
        }
        ends.sort((a, b) => b - a);
        console.log(ends);
        entity.endDate = ends[0];
        await entity.updateById(entity.id, entity);
      }
    }
  }
}
