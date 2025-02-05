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
import {Event, RecurringSchedule} from '../../models/v1';
import {EventRepository} from '../../repositories/v1';

export class EventRecurringScheduleController {
  constructor(
    @repository(EventRepository) protected eventRepository: EventRepository,
  ) {}

  @get('/events/{id}/recurring-schedule', {
    responses: {
      '200': {
        description: 'Event has one RecurringSchedule',
        content: {
          'application/json': {
            schema: getModelSchemaRef(RecurringSchedule),
          },
        },
      },
    },
  })
  async get(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<RecurringSchedule>,
  ): Promise<RecurringSchedule> {
    return this.eventRepository.recurringSchedule(id).get(filter);
  }

  @post('/events/{id}/recurring-schedule', {
    responses: {
      '200': {
        description: 'Event model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(RecurringSchedule)},
        },
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Event.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(RecurringSchedule, {
            title: 'NewRecurringScheduleInEvent',
            exclude: ['id'],
            optional: ['eventId'],
          }),
        },
      },
    })
    recurringSchedule: Omit<RecurringSchedule, 'id'>,
  ): Promise<RecurringSchedule> {
    return this.eventRepository.recurringSchedule(id).create(recurringSchedule);
  }

  @patch('/events/{id}/recurring-schedule', {
    responses: {
      '200': {
        description: 'Event.RecurringSchedule PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(RecurringSchedule, {partial: true}),
        },
      },
    })
    recurringSchedule: Partial<RecurringSchedule>,
    @param.query.object('where', getWhereSchemaFor(RecurringSchedule))
    where?: Where<RecurringSchedule>,
  ): Promise<Count> {
    return this.eventRepository
      .recurringSchedule(id)
      .patch(recurringSchedule, where);
  }

  @del('/events/{id}/recurring-schedule', {
    responses: {
      '200': {
        description: 'Event.RecurringSchedule DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(RecurringSchedule))
    where?: Where<RecurringSchedule>,
  ): Promise<Count> {
    return this.eventRepository.recurringSchedule(id).delete(where);
  }
}
