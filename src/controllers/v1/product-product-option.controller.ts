import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {Product, ProductOption} from '../../models/v1';
import {ProductRepository} from '../../repositories/v1';

export class ProductProductOptionController {
  constructor(
    @repository(ProductRepository)
    protected productRepository: ProductRepository,
  ) {}

  @get('/products/{id}/product-options', {
    responses: {
      '200': {
        description: 'Array of Product has many ProductOption',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(ProductOption)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<ProductOption>,
  ): Promise<ProductOption[]> {
    return this.productRepository.options(id).find(filter);
  }

  @post('/products/{id}/product-options', {
    responses: {
      '200': {
        description: 'Product model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(ProductOption)},
        },
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Product.prototype.name,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProductOption, {
            title: 'NewProductOptionInProduct',
            exclude: ['id'],
            optional: ['productId'],
          }),
        },
      },
    })
    productOption: Omit<ProductOption, 'id'>,
  ): Promise<ProductOption> {
    return this.productRepository.options(id).create(productOption);
  }

  @patch('/products/{id}/product-options', {
    responses: {
      '200': {
        description: 'Product.ProductOption PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProductOption, {partial: true}),
        },
      },
    })
    productOption: Partial<ProductOption>,
    @param.query.object('where', getWhereSchemaFor(ProductOption))
    where?: Where<ProductOption>,
  ): Promise<Count> {
    return this.productRepository.options(id).patch(productOption, where);
  }

  @del('/products/{id}/product-options', {
    responses: {
      '200': {
        description: 'Product.ProductOption DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(ProductOption))
    where?: Where<ProductOption>,
  ): Promise<Count> {
    return this.productRepository.options(id).delete(where);
  }
}
