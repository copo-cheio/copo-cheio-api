import {repository} from '@loopback/repository';
import {PlaceRepository} from '../../repositories';

export class PlaceCompanyController {
  constructor(
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,
  ) {}

  /*
  @get('/places/{id}/company', {
    responses: {
      '200': {
        description: 'Company belonging to Place',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Company),
          },
        },
      },
    },
  })
  async getCompany(
    @param.path.string('id') id: typeof Place.prototype.id,
  ): Promise<Company> {
    return this.placeRepository.company(id);
  }
  */
}
