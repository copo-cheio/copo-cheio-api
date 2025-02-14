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
import {Place, Team} from '../../models';
import {TeamRepository} from '../../repositories';

export class TeamPlaceController {
  constructor(
    @repository(TeamRepository) protected teamRepository: TeamRepository,
  ) {}

  @get('/teams/{id}/places', {
    responses: {
      '200': {
        description: 'Array of Team has many Place',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Place)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Place>,
  ): Promise<Place[]> {
    return this.teamRepository.places(id).find(filter);
  }

  @post('/teams/{id}/places', {
    responses: {
      '200': {
        description: 'Team model instance',
        content: {'application/json': {schema: getModelSchemaRef(Place)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Team.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Place, {
            title: 'NewPlaceInTeam',
            exclude: ['id'],
            optional: ['teamId'],
          }),
        },
      },
    })
    place: Omit<Place, 'id'>,
  ): Promise<Place> {
    return this.teamRepository.places(id).create(place);
  }

  @patch('/teams/{id}/places', {
    responses: {
      '200': {
        description: 'Team.Place PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Place, {partial: true}),
        },
      },
    })
    place: Partial<Place>,
    @param.query.object('where', getWhereSchemaFor(Place)) where?: Where<Place>,
  ): Promise<Count> {
    return this.teamRepository.places(id).patch(place, where);
  }

  @del('/teams/{id}/places', {
    responses: {
      '200': {
        description: 'Team.Place DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Place)) where?: Where<Place>,
  ): Promise<Count> {
    return this.teamRepository.places(id).delete(where);
  }
}
