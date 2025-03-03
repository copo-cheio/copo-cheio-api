import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Company, Menu} from '../models';
import {MenuRepository} from '../repositories/v1/menu.repository';

export class MenuCompanyController {
  constructor(
    @repository(MenuRepository)
    public menuRepository: MenuRepository,
  ) {}

  @get('/menus/{id}/company', {
    responses: {
      '200': {
        description: 'Company belonging to Menu',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Company),
          },
        },
      },
    },
  })
  async getCompany(
    @param.path.string('id') id: typeof Menu.prototype.id,
  ): Promise<Company> {
    return this.menuRepository.company(id);
  }
}
