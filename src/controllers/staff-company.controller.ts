import {
  repository,
} from '@loopback/repository';
import {StaffRepository} from '../repositories';

export class StaffCompanyController {
  constructor(
    @repository(StaffRepository)
    public staffRepository: StaffRepository,
  ) { }

  /*
  @get('/staff/{id}/company', {
    responses: {
      '200': {
        description: 'Company belonging to Staff',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Company),
          },
        },
      },
    },
  })
  async getCompany(
    @param.path.string('id') id: typeof Staff.prototype.id,
  ): Promise<Company> {
    return this.staffRepository.company(id);
  }
    */
}
