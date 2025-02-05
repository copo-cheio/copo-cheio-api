import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Credential, User} from '../../models/v1';
import {CredentialRepository} from '../../repositories/v1';

export class CredentialUserController {
  constructor(
    @repository(CredentialRepository)
    public credentialRepository: CredentialRepository,
  ) {}

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
