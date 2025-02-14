import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {ProductOption} from '../../models';
import {ProductOptionRepository} from '../../repositories';

export class ProductOptionController {
  constructor(
    @repository(ProductOptionRepository)
    public productOptionRepository: ProductOptionRepository,
  ) {}

  @post('/product-options')
  @response(200, {
    description: 'ProductOption model instance',
    content: {'application/json': {schema: getModelSchemaRef(ProductOption)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProductOption, {
            title: 'NewProductOption',
            exclude: ['id'],
          }),
        },
      },
    })
    productOption: Omit<ProductOption, 'id'>,
  ): Promise<ProductOption> {
    return this.productOptionRepository.create(productOption);
  }

  @get('/product-options/count')
  @response(200, {
    description: 'ProductOption model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(ProductOption) where?: Where<ProductOption>,
  ): Promise<Count> {
    return this.productOptionRepository.count(where);
  }

  @get('/product-options')
  @response(200, {
    description: 'Array of ProductOption model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(ProductOption, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(ProductOption) filter?: Filter<ProductOption>,
  ): Promise<ProductOption[]> {
    return this.productOptionRepository.find(filter);
  }

  @patch('/product-options')
  @response(200, {
    description: 'ProductOption PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProductOption, {partial: true}),
        },
      },
    })
    productOption: ProductOption,
    @param.where(ProductOption) where?: Where<ProductOption>,
  ): Promise<Count> {
    return this.productOptionRepository.updateAll(productOption, where);
  }

  @get('/product-options/{id}')
  @response(200, {
    description: 'ProductOption model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(ProductOption, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(ProductOption, {exclude: 'where'})
    filter?: FilterExcludingWhere<ProductOption>,
  ): Promise<ProductOption> {
    return this.productOptionRepository.findById(id, filter);
  }

  @patch('/product-options/{id}')
  @response(204, {
    description: 'ProductOption PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProductOption, {partial: true}),
        },
      },
    })
    productOption: ProductOption,
  ): Promise<void> {
    await this.productOptionRepository.updateById(id, productOption);
  }

  @put('/product-options/{id}')
  @response(204, {
    description: 'ProductOption PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() productOption: ProductOption,
  ): Promise<void> {
    await this.productOptionRepository.replaceById(id, productOption);
  }

  @del('/product-options/{id}')
  @response(204, {
    description: 'ProductOption DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.productOptionRepository.deleteById(id);
  }
}
