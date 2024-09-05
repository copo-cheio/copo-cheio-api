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
import {
Product,
ProductIngredient,
Ingredient,
} from '../models';
import {ProductRepository} from '../repositories';

export class ProductIngredientController {
  constructor(
    @repository(ProductRepository) protected productRepository: ProductRepository,
  ) { }

  @get('/products/{id}/ingredients', {
    responses: {
      '200': {
        description: 'Array of Product has many Ingredient through ProductIngredient',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Ingredient)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Ingredient>,
  ): Promise<Ingredient[]> {
    return this.productRepository.ingredients(id).find(filter);
  }

  @post('/products/{id}/ingredients', {
    responses: {
      '200': {
        description: 'create a Ingredient model instance',
        content: {'application/json': {schema: getModelSchemaRef(Ingredient)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Product.prototype.name,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Ingredient, {
            title: 'NewIngredientInProduct',
            exclude: ['id'],
          }),
        },
      },
    }) ingredient: Omit<Ingredient, 'id'>,
  ): Promise<Ingredient> {
    return this.productRepository.ingredients(id).create(ingredient);
  }

  @patch('/products/{id}/ingredients', {
    responses: {
      '200': {
        description: 'Product.Ingredient PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Ingredient, {partial: true}),
        },
      },
    })
    ingredient: Partial<Ingredient>,
    @param.query.object('where', getWhereSchemaFor(Ingredient)) where?: Where<Ingredient>,
  ): Promise<Count> {
    return this.productRepository.ingredients(id).patch(ingredient, where);
  }

  @del('/products/{id}/ingredients', {
    responses: {
      '200': {
        description: 'Product.Ingredient DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Ingredient)) where?: Where<Ingredient>,
  ): Promise<Count> {
    return this.productRepository.ingredients(id).delete(where);
  }
}
