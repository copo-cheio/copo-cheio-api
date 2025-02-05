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
import {Product, ProductIngredient} from '../../models/v1';
import {ProductRepository} from '../../repositories/v1';

export class ProductProductIngredientController {
  constructor(
    @repository(ProductRepository)
    protected productRepository: ProductRepository,
  ) {}

  @get('/products/{id}/product-ingredients', {
    responses: {
      '200': {
        description: 'Array of Product has many ProductIngredient',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ProductIngredient),
            },
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<ProductIngredient>,
  ): Promise<ProductIngredient[]> {
    return this.productRepository.ingredients(id).find(filter);
  }

  @post('/products/{id}/product-ingredients', {
    responses: {
      '200': {
        description: 'Product model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(ProductIngredient)},
        },
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Product.prototype.name,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProductIngredient, {
            title: 'NewProductIngredientInProduct',
            exclude: ['id'],
            optional: ['productId'],
          }),
        },
      },
    })
    productIngredient: Omit<ProductIngredient, 'id'>,
  ): Promise<ProductIngredient> {
    return this.productRepository.ingredients(id).create(productIngredient);
  }

  @patch('/products/{id}/product-ingredients', {
    responses: {
      '200': {
        description: 'Product.ProductIngredient PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProductIngredient, {partial: true}),
        },
      },
    })
    productIngredient: Partial<ProductIngredient>,
    @param.query.object('where', getWhereSchemaFor(ProductIngredient))
    where?: Where<ProductIngredient>,
  ): Promise<Count> {
    return this.productRepository
      .ingredients(id)
      .patch(productIngredient, where);
  }

  @del('/products/{id}/product-ingredients', {
    responses: {
      '200': {
        description: 'Product.ProductIngredient DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(ProductIngredient))
    where?: Where<ProductIngredient>,
  ): Promise<Count> {
    return this.productRepository.ingredients(id).delete(where);
  }
}
