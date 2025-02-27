import {Filter, FilterExcludingWhere, repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {Team} from '../../models';
import {TeamRepository} from '../../repositories';

export class TeamController {
  constructor(
    @repository(TeamRepository)
    public teamRepository: TeamRepository,
  ) {}

  @post('/teams')
  @response(200, {
    description: 'Team model instance',
    content: {'application/json': {schema: getModelSchemaRef(Team)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Team, {
            title: 'NewTeam',
            exclude: ['id'],
          }),
        },
      },
    })
    team: Omit<Team, 'id'>,
  ): Promise<Team> {
    return this.teamRepository.create(team);
  }

  @get('/teams')
  // @authenticate("firebase")
  @response(200, {
    description: 'Array of Team model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Team, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Team) filter?: Filter<Team>): Promise<Team[]> {
    const identifier = await this.teamRepository.getIdentifier();
    console.log({
      identifier,
      getCurrentUser: this.teamRepository.getCurrentUser,
    });
    return this.teamRepository.find(filter);
  }

  @get('/teams/{id}')
  @response(200, {
    description: 'Team model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Team, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Team, {exclude: 'where'}) filter?: FilterExcludingWhere<Team>,
  ): Promise<Team> {
    return this.teamRepository.findById(id, filter);
  }

  @patch('/teams/{id}')
  @response(204, {
    description: 'Team PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Team, {partial: true}),
        },
      },
    })
    team: Team,
  ): Promise<void> {
    await this.teamRepository.updateById(id, team);
  }
}
