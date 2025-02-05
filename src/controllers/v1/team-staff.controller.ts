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
import {Staff, Team} from '../../models/v1';
import {TeamRepository} from '../../repositories/v1';

export class TeamStaffController {
  constructor(
    @repository(TeamRepository) protected teamRepository: TeamRepository,
  ) {}

  @get('/teams/{id}/staff', {
    responses: {
      '200': {
        description: 'Array of Team has many Staff through TeamStaff',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Staff)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Staff>,
  ): Promise<Staff[]> {
    return this.teamRepository.staff(id).find(filter);
  }

  @post('/teams/{id}/staff', {
    responses: {
      '200': {
        description: 'create a Staff model instance',
        content: {'application/json': {schema: getModelSchemaRef(Staff)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Team.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Staff, {
            title: 'NewStaffInTeam',
            exclude: ['id'],
          }),
        },
      },
    })
    staff: Omit<Staff, 'id'>,
  ): Promise<Staff> {
    return this.teamRepository.staff(id).create(staff);
  }

  @patch('/teams/{id}/staff', {
    responses: {
      '200': {
        description: 'Team.Staff PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Staff, {partial: true}),
        },
      },
    })
    staff: Partial<Staff>,
    @param.query.object('where', getWhereSchemaFor(Staff)) where?: Where<Staff>,
  ): Promise<Count> {
    return this.teamRepository.staff(id).patch(staff, where);
  }

  @del('/teams/{id}/staff', {
    responses: {
      '200': {
        description: 'Team.Staff DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Staff)) where?: Where<Staff>,
  ): Promise<Count> {
    return this.teamRepository.staff(id).delete(where);
  }
}
