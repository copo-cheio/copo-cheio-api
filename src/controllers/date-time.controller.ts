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
  IncludeScheduleRangeRelation,
  ScheduleTypes,
} from "../blueprints/shared/schedule.include";
import {DateTime} from "../models";
import {
  DateTimeRepository,
  EventRepository,
  ScheduleRepository,
} from "../repositories";

export class DateTimeController {
  constructor(
    @repository(DateTimeRepository)
    public dateTimeRepository: DateTimeRepository,
    @repository(EventRepository)
    public eventRepository: EventRepository,
    @repository(ScheduleRepository)
    public scheduleRepository: ScheduleRepository
  ) {}

  @post("/date-times")
  @response(200, {
    description: "DateTime model instance",
    content: { "application/json": { schema: getModelSchemaRef(DateTime) } },
  })
  async create(
    @requestBody({
      content: {
        "application/json": {
          exclude: ["id", "updated_at", "created_at"],
          schema: getModelSchemaRef(DateTime, {
            title: "NewDateTime",
            exclude: [ "updated_at", "created_at"],
          }),
        },
      },
    })
    dateTime: DateTime
  ): Promise<DateTime> {
    const result = await  this.dateTimeRepository.create(dateTime);
    const entity = await this.dateTimeRepository.findById(result.id)
    await this.updateEventScheduleData(entity);
    return result;
  }

  @get("/date-times/count")
  @response(200, {
    description: "DateTime model count",
    content: { "application/json": { schema: CountSchema } },
  })
  async count(@param.where(DateTime) where?: Where<DateTime>): Promise<Count> {
    return this.dateTimeRepository.count(where);
  }

  @get("/date-times")
  @response(200, {
    description: "Array of DateTime model instances",
    content: {
      "application/json": {
        schema: {
          type: "array",
          items: getModelSchemaRef(DateTime, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(DateTime) filter?: Filter<DateTime>
  ): Promise<DateTime[]> {
    return this.dateTimeRepository.find(filter);
  }

  @patch("/date-times")
  @response(200, {
    description: "DateTime PATCH success count",
    content: { "application/json": { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        "application/json": {
          exclude: ["id", "updated_at", "created_at"],
          schema: getModelSchemaRef(DateTime, { partial: true }),
        },
      },
    })
    dateTime: DateTime,
    @param.where(DateTime) where?: Where<DateTime>
  ): Promise<Count> {
    return this.dateTimeRepository.updateAll(dateTime, where);
  }

  @get("/date-times/{id}")
  @response(200, {
    description: "DateTime model instance",
    content: {
      "application/json": {
        schema: getModelSchemaRef(DateTime, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.string("id") id: string,
    @param.filter(DateTime, { exclude: "where" })
    filter?: FilterExcludingWhere<DateTime>
  ): Promise<DateTime> {
    return this.dateTimeRepository.findById(id, filter);
  }

  @patch("/date-times/{id}")
  @response(204, {
    description: "DateTime PATCH success",
  })
  async updateById(
    @param.path.string("id") id: string,
    @requestBody({
      content: {
        "application/json": {
          exclude: ["id", "updated_at", "created_at"],
          schema: getModelSchemaRef(DateTime, { partial: true }),
        },
      },
    })
    dateTime: DateTime
  ): Promise<void> {
    const result =  await this.dateTimeRepository.updateById(id, dateTime);

    const entity = await this.dateTimeRepository.findById(id)
    await this.updateEventScheduleData(entity);
    return result;
  }

  @put("/date-times/{id}")
  @response(204, {
    description: "DateTime PUT success",
  })
  async replaceById(
    @param.path.string("id") id: string,
    @requestBody() dateTime: DateTime
  ): Promise<void> {

    const result =
    await this.dateTimeRepository.replaceById(id, dateTime);
    const entity = await this.dateTimeRepository.findById(id)
    await this.updateEventScheduleData(entity);
    return result;
  }

  @del("/date-times/{id}")
  @response(204, {
    description: "DateTime DELETE success",
  })
  async deleteById(@param.path.string("id") id: string): Promise<void> {
    await this.dateTimeRepository.deleteById(id);
  }

  private async updateEventScheduleData(entity: any) {
    if (entity?.id) {
      const event = await this.eventRepository.findOne({
        where: {
          scheduleId: entity.scheduleId,
        },
      });
      const entitys: any[] = await this.dateTimeRepository.find({
        where: {
          scheduleId: entity.scheduleId,
        },
      });
      const schedule: any = await this.scheduleRepository.findById(
        entity.scheduleId,
        { include: [IncludeScheduleRangeRelation] }
      );
      if (!event) return;
      event.type = schedule.type;
      if (entity.type == ScheduleTypes[0]) {
        const ends: any[] = [new Date("1900-01-01")];
        if (Array.isArray(schedule?.scheduleRanges)) {
          schedule.scheduleRanges.forEach((sr: any) => {
            if (sr?.end?.datetime) {
              ends.push(new Date(sr.end.datetime));
            }
          });
        }
        ends.sort((a, b) => b - a);

        event.endDate = ends[0];
      } else {
        event.endDate = new Date("3145-01-01");
      }
      await this.eventRepository.updateById(event.id, event);
    }
  }
}
