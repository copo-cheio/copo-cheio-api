import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Image, Product} from '../../models';
import {ProductRepository} from '../../repositories';

export class ProductImageController {
  constructor(
    @repository(ProductRepository)
    public productRepository: ProductRepository,
  ) {}

  @get('/products/{id}/image', {
    responses: {
      '200': {
        description: 'Image belonging to Product',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Image),
          },
        },
      },
    },
  })
  async getImage(
    @param.path.string('id') id: typeof Product.prototype.name,
  ): Promise<Image> {
    return this.productRepository.thumbnail(id);
  }
}
