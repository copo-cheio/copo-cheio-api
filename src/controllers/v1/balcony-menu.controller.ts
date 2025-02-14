import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Balcony, Menu} from '../../models';
import {BalconyRepository} from '../../repositories';

export class BalconyMenuController {
  constructor(
    @repository(BalconyRepository)
    public balconyRepository: BalconyRepository,
  ) {}

  @get('/balconies/{id}/menu', {
    responses: {
      '200': {
        description: 'Menu belonging to Balcony',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Menu),
          },
        },
      },
    },
  })
  async getMenu(
    @param.path.string('id') id: typeof Balcony.prototype.id,
  ): Promise<Menu> {
    return this.balconyRepository.menu(id);
  }
}
