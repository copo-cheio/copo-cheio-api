import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {Event, OpeningHours} from '../../models';
import {EventRepository} from '../../repositories';

export class EventOpeningHoursController {
  constructor(
    @repository(EventRepository) protected eventRepository: EventRepository,
  ) {}

  @get('/events/{id}/opening-hours', {
    responses: {
      '200': {
        description: 'Array of Event has many OpeningHours',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(OpeningHours)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<OpeningHours>,
  ): Promise<OpeningHours[]> {
    return this.eventRepository.openingHours(id).find(filter);
  }

  @post('/events/{id}/opening-hours', {
    responses: {
      '200': {
        description: 'Event model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(OpeningHours)},
        },
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Event.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OpeningHours, {
            title: 'NewOpeningHoursInEvent',
            exclude: ['id'],
            optional: ['eventId'],
          }),
        },
      },
    })
    openingHours: Omit<OpeningHours, 'id'>,
  ): Promise<OpeningHours> {
    return this.eventRepository.openingHours(id).create(openingHours);
  }

  @patch('/events/{id}/opening-hours', {
    responses: {
      '200': {
        description: 'Event.OpeningHours PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OpeningHours, {partial: true}),
        },
      },
    })
    openingHours: Partial<OpeningHours>,
    @param.query.object('where', getWhereSchemaFor(OpeningHours))
    where?: Where<OpeningHours>,
  ): Promise<Count> {
    return this.eventRepository.openingHours(id).patch(openingHours, where);
  }

  @del('/events/{id}/opening-hours', {
    responses: {
      '200': {
        description: 'Event.OpeningHours DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(OpeningHours))
    where?: Where<OpeningHours>,
  ): Promise<Count> {
    return this.eventRepository.openingHours(id).delete(where);
  }
}
