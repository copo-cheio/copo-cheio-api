import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Team,
  Company,
} from '../models';
import {TeamRepository} from '../repositories';

export class TeamCompanyController {
  constructor(
    @repository(TeamRepository)
    public teamRepository: TeamRepository,
  ) { }

  @get('/teams/{id}/company', {
    responses: {
      '200': {
        description: 'Company belonging to Team',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Company),
          },
        },
      },
    },
  })
  async getCompany(
    @param.path.string('id') id: typeof Team.prototype.id,
  ): Promise<Company> {
    return this.teamRepository.company(id);
  }
}
