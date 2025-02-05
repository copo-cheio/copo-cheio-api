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
import {Team, TeamStaff} from '../../models/v1';
import {TeamRepository} from '../../repositories/v1';

export class TeamTeamStaffController {
  constructor(
    @repository(TeamRepository) protected teamRepository: TeamRepository,
  ) {}

  @get('/teams/{id}/team-staffs', {
    responses: {
      '200': {
        description: 'Array of Team has many TeamStaff',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(TeamStaff)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<TeamStaff>,
  ): Promise<TeamStaff[]> {
    return this.teamRepository.teamStaffs(id).find(filter);
  }

  @post('/teams/{id}/team-staffs', {
    responses: {
      '200': {
        description: 'Team model instance',
        content: {'application/json': {schema: getModelSchemaRef(TeamStaff)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Team.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TeamStaff, {
            title: 'NewTeamStaffInTeam',
            exclude: ['id'],
            optional: ['teamId'],
          }),
        },
      },
    })
    teamStaff: Omit<TeamStaff, 'id'>,
  ): Promise<TeamStaff> {
    return this.teamRepository.teamStaffs(id).create(teamStaff);
  }

  @patch('/teams/{id}/team-staffs', {
    responses: {
      '200': {
        description: 'Team.TeamStaff PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TeamStaff, {partial: true}),
        },
      },
    })
    teamStaff: Partial<TeamStaff>,
    @param.query.object('where', getWhereSchemaFor(TeamStaff))
    where?: Where<TeamStaff>,
  ): Promise<Count> {
    return this.teamRepository.teamStaffs(id).patch(teamStaff, where);
  }

  @del('/teams/{id}/team-staffs', {
    responses: {
      '200': {
        description: 'Team.TeamStaff DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(TeamStaff))
    where?: Where<TeamStaff>,
  ): Promise<Count> {
    return this.teamRepository.teamStaffs(id).delete(where);
  }
}
