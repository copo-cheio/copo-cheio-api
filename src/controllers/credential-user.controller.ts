import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Credential,
  User,
} from '../models';
import {CredentialRepository} from '../repositories';

export class CredentialUserController {
  constructor(
    @repository(CredentialRepository)
    public credentialRepository: CredentialRepository,
  ) { }

  @get('/credentials/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to Credential',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User),
          },
        },
      },
    },
  })
  async getUser(
    @param.path.number('id') id: typeof Credential.prototype.id,
  ): Promise<User> {
    return this.credentialRepository.user(id);
  }
}
