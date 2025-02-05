import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Image, Product} from '../../models/v1';
import {ProductRepository} from '../../repositories/v1';

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
