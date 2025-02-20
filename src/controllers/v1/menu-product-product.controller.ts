import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {IncludePriceRelation} from '../../blueprints/shared/price.include';
import {IncludeProductRelation} from '../../blueprints/shared/product.include';
import {MenuProduct, Product} from '../../models';
import {MenuProductRepository} from '../../repositories';

export class MenuProductProductController {
  constructor(
    @repository(MenuProductRepository)
    public menuProductRepository: MenuProductRepository,
  ) {}

  @get('/menu-products/{id}/product', {
    responses: {
      '200': {
        description: 'Product belonging to MenuProduct',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Product),
          },
        },
      },
    },
  })
  async getProduct(
    @param.path.string('id') id: typeof MenuProduct.prototype.id,
  ): Promise<any> {
    return this.menuProductRepository.findById(id, {
      include: [IncludePriceRelation, IncludeProductRelation],
    });
  }
}
