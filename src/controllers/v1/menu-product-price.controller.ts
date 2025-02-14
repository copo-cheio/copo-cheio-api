import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {MenuProduct, Price} from '../../models';
import {MenuProductRepository} from '../../repositories';

export class MenuProductPriceController {
  constructor(
    @repository(MenuProductRepository)
    public menuProductRepository: MenuProductRepository,
  ) {}

  @get('/menu-products/{id}/price', {
    responses: {
      '200': {
        description: 'Price belonging to MenuProduct',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Price),
          },
        },
      },
    },
  })
  async getPrice(
    @param.path.string('id') id: typeof MenuProduct.prototype.id,
  ): Promise<Price> {
    return this.menuProductRepository.price(id);
  }
}
