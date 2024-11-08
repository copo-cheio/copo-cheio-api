import {
  repository
} from '@loopback/repository';
import {CompanyRepository} from '../repositories';

export class CompanyTeamController {
  constructor(
    @repository(CompanyRepository) protected companyRepository: CompanyRepository,
  ) { }

  /*
  @get('/companies/{id}/teams', {
    responses: {
      '200': {
        description: 'Array of Company has many Team',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Team)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Team>,
  ): Promise<Team[]> {
    return this.companyRepository.teams(id).find(filter);
  }

  @post('/companies/{id}/teams', {
    responses: {
      '200': {
        description: 'Company model instance',
        content: {'application/json': {schema: getModelSchemaRef(Team)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Company.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Team, {
            title: 'NewTeamInCompany',
            exclude: ['id'],
            optional: ['companyId']
          }),
        },
      },
    }) team: Omit<Team, 'id'>,
  ): Promise<Team> {
    return this.companyRepository.teams(id).create(team);
  }

  @patch('/companies/{id}/teams', {
    responses: {
      '200': {
        description: 'Company.Team PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Team, {partial: true}),
        },
      },
    })
    team: Partial<Team>,
    @param.query.object('where', getWhereSchemaFor(Team)) where?: Where<Team>,
  ): Promise<Count> {
    return this.companyRepository.teams(id).patch(team, where);
  }

  @del('/companies/{id}/teams', {
    responses: {
      '200': {
        description: 'Company.Team DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Team)) where?: Where<Team>,
  ): Promise<Count> {
    return this.companyRepository.teams(id).delete(where);
  }
    */
}
