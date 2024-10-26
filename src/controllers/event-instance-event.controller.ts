import {Filter,repository} from "@loopback/repository";
import {get,getModelSchemaRef,param} from "@loopback/rest";
import {Event,EventInstance} from "../models";
import {EventInstanceRepository} from "../repositories";

export class EventInstanceEventController {
  constructor(
    @repository(EventInstanceRepository)
    public eventInstanceRepository: EventInstanceRepository
  ) {}

  @get("/event-instances/{id}/event", {
    responses: {
      "200": {
        description: "Event belonging to EventInstance",
        content: {
          "application/json": {
            schema: getModelSchemaRef(Event),
          },
        },
      },
    },
  })
  async getEvent(
    @param.path.string("id") id: typeof EventInstance.prototype.id
  ): Promise<Event> {
    return this.eventInstanceRepository.event(id);
  }
  @get("/event-instances", {
    responses: {
      "200": {
        description: "Event belonging to EventInstance",
        content: {
          "application/json": {
            schema: getModelSchemaRef(Event),
          },
        },
      },
    },
  })
  async getEventInstances(): Promise<EventInstance[]> {
    return this.eventInstanceRepository.findAll({
      offset: 0,
      limit: 100,
      skip: 0,
      // order: "startDate DESC",
      where:{
        deleted:false
      },
      fields: {
        id: true,
        startDate: true,
        endDate: true,
        eventId: true,
        latitude: true,
        longitude: true,
      },
      include: [{ relation: "event" }],

    });
  }
  @get("/event-instances/raw", {
    responses: {
      "200": {
        description: "Event belonging to EventInstance",
        content: {
          "application/json": {
            schema: getModelSchemaRef(Event),
          },
        },
      },
    },
  })
  async getEventInstancesRaw(
    @param.filter(EventInstance) filter?: Filter<EventInstance>
  ): Promise<EventInstance[]> {

//     const query = `SELECT DISTINCT ${field} FROM EventInstance WHERE startTime >= ?`;
// const params = ['2024-10-01T00:00:00Z'];

// const distinctValues = await this.eventInstanceRepository.dataSource.execute(query, params);
    return this.eventInstanceRepository.findAll(filter);
  }
}
