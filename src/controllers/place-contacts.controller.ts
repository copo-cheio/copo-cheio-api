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
  Contacts,
  Place
} from '../models';
import {PlaceRepository} from '../repositories';

export class PlaceContactsController {
  constructor(
    @repository(PlaceRepository) protected placeRepository: PlaceRepository,
  ) { }

  @get('/places/{id}/contacts', {
    responses: {
      '200': {
        description: 'Place has one Contacts',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Contacts),
          },
        },
      },
    },
  })
  async get(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Contacts>,
  ): Promise<Contacts> {
    return this.placeRepository.contacts(id).get(filter);
  }

  @post('/places/{id}/contacts', {
    responses: {
      '200': {
        description: 'Place model instance',
        content: {'application/json': {schema: getModelSchemaRef(Contacts)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Place.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Contacts, {
            title: 'NewContactsInPlace',
            exclude: ['id'],
            optional: ['refId']
          }),
        },
      },
    }) contacts: Omit<Contacts, 'id'>,
  ): Promise<Contacts> {
    return this.placeRepository.contacts(id).create(contacts);
  }

  @patch('/places/{id}/contacts', {
    responses: {
      '200': {
        description: 'Place.Contacts PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Contacts, {partial: true}),
        },
      },
    })
    contacts: Partial<Contacts>,
    @param.query.object('where', getWhereSchemaFor(Contacts)) where?: Where<Contacts>,
  ): Promise<Count> {
    return this.placeRepository.contacts(id).patch(contacts, where);
  }

  @del('/places/{id}/contacts', {
    responses: {
      '200': {
        description: 'Place.Contacts DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Contacts)) where?: Where<Contacts>,
  ): Promise<Count> {
    return this.placeRepository.contacts(id).delete(where);
  }
}
