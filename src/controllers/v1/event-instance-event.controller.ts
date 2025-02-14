import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  patch,
  requestBody,
  response,
} from '@loopback/rest';
import {EventInstanceFullQuery} from '../../blueprints/event.blueprint';
import {Event, EventInstance} from '../../models';
import {EventInstanceRepository} from '../../repositories';

export class EventInstanceEventController {
  constructor(
    @repository(EventInstanceRepository)
    public eventInstanceRepository: EventInstanceRepository,
  ) {}

  @get('/event-instances/{id}', {
    responses: {
      '200': {
        description: 'Event belonging to EventInstance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(EventInstance),
          },
        },
      },
    },
  })
  async getEventInstance(
    @param.path.string('id') id: typeof EventInstance.prototype.id,
  ): Promise<EventInstance> {
    return this.eventInstanceRepository.findById(id, EventInstanceFullQuery);
  }

  @get('/event-instances', {
    responses: {
      '200': {
        description: 'Event belonging to EventInstance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Event),
          },
        },
      },
    },
  })
  async getEventInstances(
    @param.filter(EventInstance) filter?: Filter<EventInstance>,
    // @param.where(EventInstance) where?: Where<EventInstance>,
  ): Promise<EventInstance[]> {
    let where: any = filter?.where || {};
    where.deleted = false;
    where = {
      and: Object.keys(where).map(key => {
        const q: any = {};
        // @ts-ignore
        q[key] = where[key];
        return q;
      }),
    };

    return this.eventInstanceRepository.findAll({
      offset: filter?.offset || 0,
      limit: filter?.limit || 100,
      skip: filter?.skip || 0,

      where,
      // where:{
      //   deleted:false,
      //   ...where
      // },
      fields: {
        id: true,
        startDate: true,
        endDate: true,
        eventId: true,
        latitude: true,
        longitude: true,
        deleted: true,
      },
      include: [{relation: 'event'}],
    });
  }
  @get('/event-instances/raw', {
    responses: {
      '200': {
        description: 'Event belonging to EventInstance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Event),
          },
        },
      },
    },
  })
  async getEventInstancesRaw(
    @param.filter(EventInstance) filter?: Filter<EventInstance>,
  ): Promise<EventInstance[]> {
    // @ts-ignore
    filter.order = ['startDate DESC'];
    return this.eventInstanceRepository.findAll(filter);
  }
  @patch('/event-instances/raw')
  @response(200, {
    description: 'EventInstance PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          exclude: ['updated_at', 'created_at'],
          schema: getModelSchemaRef(EventInstance, {partial: true}),
        },
      },
    })
    eventInstance: EventInstance,
    @param.where(EventInstance) where?: Where<EventInstance>,
  ): Promise<Count> {
    return this.eventInstanceRepository.updateAll(eventInstance, where);
  }
}
