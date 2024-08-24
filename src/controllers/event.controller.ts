import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
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
} from '@loopback/rest';
import {EventFullQuery,EventsQuery} from '../blueprints/event.blueprint';
import {Event} from '../models';
import {EventRepository} from '../repositories';

/**
{
  "include": [
    "place",
    "cover",
    "address",
    "tags",
    {
      "relation": "schedule",
      "scope": {
        "include": [
          {
            "relation": "scheduleRanges",
            "scope": {
              "include": [
                "start",
                "end"
              ]
            }
          }
        ]
      }
    },
    {
      "relation": "tickets",
      "scope": {
        "include": [
          {
            "relation": "price",
            "scope": {
              "include": [
                "currency"
              ]
            }
          }
        ]
      }
    },
 {
      "relation": "playlist",
      "scope": {
        "include": [
          {
            "relation": "songs",
            "scope": {
              "include": [
                "artist"
              ]
            }
          }
        ]
      }
    },
 {
      "relation": "rules"

    }
  ]
}
  */
export class EventController {
  constructor(
    @repository(EventRepository)
    public eventRepository : EventRepository,
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
      where:{
        "or":results.map((r:any)=>{return {id:r.id}})
      },
      sort:["distance DESC"]
    }
    return this.eventRepository.find(_filter)
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


  @post('/events')
  @response(200, {
    description: 'Event model instance',
    content: {'application/json': {schema: getModelSchemaRef(Event)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          exclude: ["id", "updated_at", "created_at"],
          schema: getModelSchemaRef(Event, {
            title: 'NewEvent',
            exclude: ["id", "updated_at", "created_at"],
          }),
        },
      },
    })
    event: Omit<Event, 'id'>,
  ): Promise<Event> {
    return this.eventRepository.create(event);
  }

  @get('/events/count')
  @response(200, {
    description: 'Event model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Event) where?: Where<Event>,
  ): Promise<Count> {
    return this.eventRepository.count(where);
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
  async find(
    @param.filter(Event) filter?: Filter<Event>,
  ): Promise<Event[]> {
    return this.eventRepository.find(EventsQuery);
  }

  @patch('/events')
  @response(200, {
    description: 'Event PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          exclude: ["id", "updated_at", "created_at"],
          schema: getModelSchemaRef(Event, {partial: true}),
        },
      },
    })
    event: Event,
    @param.where(Event) where?: Where<Event>,
  ): Promise<Count> {
    return this.eventRepository.updateAll(event, where);
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
    @param.filter(Event, {exclude: 'where'}) filter?: FilterExcludingWhere<Event>
  ): Promise<Event> {
    return this.eventRepository.findById(id, filter);
  }

  @patch('/events/{id}')
  @response(204, {
    description: 'Event PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          exclude: ["id", "updated_at", "created_at"],
          schema: getModelSchemaRef(Event, {partial: true}),
        },
      },
    })
    event: Event,
  ): Promise<void> {
    await this.eventRepository.updateById(id, event);
  }

  @put('/events/{id}')
  @response(204, {
    description: 'Event PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() event: Event,
  ): Promise<void> {
    await this.eventRepository.replaceById(id, event);
  }

  @del('/events/{id}')
  @response(204, {
    description: 'Event DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.eventRepository.deleteById(id);
  }
}
