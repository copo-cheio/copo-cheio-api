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
  OrderV2,
  Image,
} from '../models';
import {OrderV2Repository} from '../repositories';

export class OrderV2ImageController {
  constructor(
    @repository(OrderV2Repository) protected orderV2Repository: OrderV2Repository,
  ) { }

  @get('/order-v2s/{id}/image', {
    responses: {
      '200': {
        description: 'OrderV2 has one Image',
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
    return this.orderV2Repository.qrCode(id).get(filter);
  }

  @post('/order-v2s/{id}/image', {
    responses: {
      '200': {
        description: 'OrderV2 model instance',
        content: {'application/json': {schema: getModelSchemaRef(Image)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof OrderV2.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Image, {
            title: 'NewImageInOrderV2',
            exclude: ['id'],
            optional: ['orderV2Id']
          }),
        },
      },
    }) image: Omit<Image, 'id'>,
  ): Promise<Image> {
    return this.orderV2Repository.qrCode(id).create(image);
  }

  @patch('/order-v2s/{id}/image', {
    responses: {
      '200': {
        description: 'OrderV2.Image PATCH success count',
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
    return this.orderV2Repository.qrCode(id).patch(image, where);
  }

  @del('/order-v2s/{id}/image', {
    responses: {
      '200': {
        description: 'OrderV2.Image DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Image)) where?: Where<Image>,
  ): Promise<Count> {
    return this.orderV2Repository.qrCode(id).delete(where);
  }
}
