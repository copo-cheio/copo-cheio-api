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
import {Lineup, LineUpArtist} from '../../models';
import {LineupRepository} from '../../repositories';

export class LineupLineUpArtistController {
  constructor(
    @repository(LineupRepository) protected lineupRepository: LineupRepository,
  ) {}

  @get('/lineups/{id}/line-up-artists', {
    responses: {
      '200': {
        description: 'Array of Lineup has many LineUpArtist',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(LineUpArtist)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<LineUpArtist>,
  ): Promise<LineUpArtist[]> {
    return this.lineupRepository.lineUpArtists(id).find(filter);
  }

  @post('/lineups/{id}/line-up-artists', {
    responses: {
      '200': {
        description: 'Lineup model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(LineUpArtist)},
        },
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Lineup.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(LineUpArtist, {
            title: 'NewLineUpArtistInLineup',
            exclude: ['id'],
            optional: ['lineupId'],
          }),
        },
      },
    })
    lineUpArtist: Omit<LineUpArtist, 'id'>,
  ): Promise<LineUpArtist> {
    return this.lineupRepository.lineUpArtists(id).create(lineUpArtist);
  }

  @patch('/lineups/{id}/line-up-artists', {
    responses: {
      '200': {
        description: 'Lineup.LineUpArtist PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(LineUpArtist, {partial: true}),
        },
      },
    })
    lineUpArtist: Partial<LineUpArtist>,
    @param.query.object('where', getWhereSchemaFor(LineUpArtist))
    where?: Where<LineUpArtist>,
  ): Promise<Count> {
    return this.lineupRepository.lineUpArtists(id).patch(lineUpArtist, where);
  }

  @del('/lineups/{id}/line-up-artists', {
    responses: {
      '200': {
        description: 'Lineup.LineUpArtist DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(LineUpArtist))
    where?: Where<LineUpArtist>,
  ): Promise<Count> {
    return this.lineupRepository.lineUpArtists(id).delete(where);
  }
}
