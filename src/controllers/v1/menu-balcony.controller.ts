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
import {Balcony, Menu} from '../../models';
import {MenuRepository} from '../../repositories/v1/menu.repository';

export class MenuBalconyController {
  constructor(
    @repository(MenuRepository) protected menuRepository: MenuRepository,
  ) {}

  @get('/menus/{id}/balconies', {
    responses: {
      '200': {
        description: 'Array of Menu has many Balcony',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Balcony)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Balcony>,
  ): Promise<Balcony[]> {
    return this.menuRepository.balconies(id).find(filter);
  }

  @post('/menus/{id}/balconies', {
    responses: {
      '200': {
        description: 'Menu model instance',
        content: {'application/json': {schema: getModelSchemaRef(Balcony)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Menu.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Balcony, {
            title: 'NewBalconyInMenu',
            exclude: ['menuId'],
            optional: ['menuId'],
          }),
        },
      },
    })
    balcony: Omit<Balcony, 'menuId'>,
  ): Promise<Balcony> {
    return this.menuRepository.balconies(id).create(balcony);
  }

  @patch('/menus/{id}/balconies', {
    responses: {
      '200': {
        description: 'Menu.Balcony PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Balcony, {partial: true}),
        },
      },
    })
    balcony: Partial<Balcony>,
    @param.query.object('where', getWhereSchemaFor(Balcony))
    where?: Where<Balcony>,
  ): Promise<Count> {
    return this.menuRepository.balconies(id).patch(balcony, where);
  }

  @del('/menus/{id}/balconies', {
    responses: {
      '200': {
        description: 'Menu.Balcony DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Balcony))
    where?: Where<Balcony>,
  ): Promise<Count> {
    return this.menuRepository.balconies(id).delete(where);
  }
}
