import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Company, Image} from '../../models/v1';
import {CompanyRepository} from '../../repositories/v1';

export class CompanyImageController {
  constructor(
    @repository(CompanyRepository)
    public companyRepository: CompanyRepository,
  ) {}

  @get('/companies/{id}/image', {
    responses: {
      '200': {
        description: 'Image belonging to Company',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Image),
          },
        },
      },
    },
  })
  async getImage(
    @param.path.string('id') id: typeof Company.prototype.id,
  ): Promise<Image> {
    return this.companyRepository.cover(id);
  }
}
