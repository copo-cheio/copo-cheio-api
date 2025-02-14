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
import {Image, Order} from '../../models';
import {OrderRepository} from '../../repositories';

export class OrderImageController {
  constructor(
    @repository(OrderRepository) protected orderRepository: OrderRepository,
  ) {}

  @get('/orders/{id}/image', {
    responses: {
      '200': {
        description: 'Order has one Image',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Image),
          },
        },
      },
    },
  })
  async get(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Image>,
  ): Promise<Image> {
    return this.orderRepository.qr(id).get(filter);
  }

  @post('/orders/{id}/image', {
    responses: {
      '200': {
        description: 'Order model instance',
        content: {'application/json': {schema: getModelSchemaRef(Image)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Order.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Image, {
            title: 'NewImageInOrder',
            exclude: ['id'],
            optional: ['orderId'],
          }),
        },
      },
    })
    image: Omit<Image, 'id'>,
  ): Promise<Image> {
    return this.orderRepository.qr(id).create(image);
  }

  @patch('/orders/{id}/image', {
    responses: {
      '200': {
        description: 'Order.Image PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Image, {partial: true}),
        },
      },
    })
    image: Partial<Image>,
    @param.query.object('where', getWhereSchemaFor(Image)) where?: Where<Image>,
  ): Promise<Count> {
    return this.orderRepository.qr(id).patch(image, where);
  }

  @del('/orders/{id}/image', {
    responses: {
      '200': {
        description: 'Order.Image DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Image)) where?: Where<Image>,
  ): Promise<Count> {
    return this.orderRepository.qr(id).delete(where);
  }
}
