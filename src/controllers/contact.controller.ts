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
import {Contacts} from '../models';
import {ContactsRepository} from '../repositories';
import {isValidEmail,isValidHttpUrl} from '../utils/validations';

export class ContactController {
  constructor(
    @repository(ContactsRepository)
    public contactsRepository : ContactsRepository,
  ) {}

  @post('/contacts')
  @response(200, {
    description: 'Contacts model instance',
    content: {'application/json': {schema: getModelSchemaRef(Contacts)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Contacts, {
            title: 'NewContacts',
            exclude: ['id'],
          }),
        },
      },
    })
    contacts: Omit<Contacts, 'id'>,
  ): Promise<Contacts> {
    return this.contactsRepository.create(contacts);
  }

  @get('/contacts/count')
  @response(200, {
    description: 'Contacts model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Contacts) where?: Where<Contacts>,
  ): Promise<Count> {
    return this.contactsRepository.count(where);
  }

  @get('/contacts')
  @response(200, {
    description: 'Array of Contacts model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Contacts, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Contacts) filter?: Filter<Contacts>,
  ): Promise<Contacts[]> {
    return this.contactsRepository.find(filter);
  }

  @patch('/contacts')
  @response(200, {
    description: 'Contacts PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Contacts, {partial: true}),
        },
      },
    })
    contacts: Contacts,
    @param.where(Contacts) where?: Where<Contacts>,
  ): Promise<Count> {


    if(contacts?.phone && contacts.phone.indexOf('+') == -1 ) contacts.phone = '+351'+contacts.phone;
    if(contacts?.email && !isValidEmail(contacts.email)) delete contacts.email
    if(contacts?.website && !isValidHttpUrl(contacts.website)) delete contacts.website
    if(Object.keys(contacts).length>0){

      return this.contactsRepository.updateAll(contacts, where);
    }
    return Promise.resolve({count:0})
  }

  @get('/contacts/{id}')
  @response(200, {
    description: 'Contacts model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Contacts, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Contacts, {exclude: 'where'}) filter?: FilterExcludingWhere<Contacts>
  ): Promise<Contacts> {
    return this.contactsRepository.findById(id, filter);
  }

  @patch('/contacts/{id}')
  @response(204, {
    description: 'Contacts PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Contacts, {partial: true}),
        },
      },
    })
    contacts: Contacts,
  ): Promise<void> {
    await this.contactsRepository.updateById(id, contacts);
  }

  @put('/contacts/{id}')
  @response(204, {
    description: 'Contacts PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() contacts: Contacts,
  ): Promise<void> {
    await this.contactsRepository.replaceById(id, contacts);
  }

  @del('/contacts/{id}')
  @response(204, {
    description: 'Contacts DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.contactsRepository.deleteById(id);
  }
}
