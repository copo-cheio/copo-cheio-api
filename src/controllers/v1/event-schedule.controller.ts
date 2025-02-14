import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {IncludeScheduleRelation} from '../../blueprints/shared/schedule.include';
import {Event, Schedule} from '../../models';
import {EventRepository, ScheduleRepository} from '../../repositories';

export class EventScheduleController {
  constructor(
    @repository(EventRepository)
    public eventRepository: EventRepository,
    @repository(ScheduleRepository)
    public scheduleRepository: ScheduleRepository,
  ) {}

  @get('/events/{id}/schedule', {
    responses: {
      '200': {
        description: 'Schedule belonging to Event',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Schedule, {includeRelations: true}),
          },
        },
      },
    },
  })
  async getSchedule(
    @param.path.string('id') id: typeof Event.prototype.id,
  ): Promise<Schedule> {
    const evt = await this.eventRepository.findById(id, {
      include: [IncludeScheduleRelation],
    });
    return (evt as any).schedule;
  }
}
