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
import {Lineup, TimeTable} from '../../models';
import {LineupRepository} from '../../repositories';

export class LineupTimeTableController {
  constructor(
    @repository(LineupRepository) protected lineupRepository: LineupRepository,
  ) {}

  @get('/lineups/{id}/time-tables', {
    responses: {
      '200': {
        description: 'Array of Lineup has many TimeTable',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(TimeTable)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<TimeTable>,
  ): Promise<TimeTable[]> {
    return this.lineupRepository.timeTables(id).find(filter);
  }

  @post('/lineups/{id}/time-tables', {
    responses: {
      '200': {
        description: 'Lineup model instance',
        content: {'application/json': {schema: getModelSchemaRef(TimeTable)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Lineup.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TimeTable, {
            title: 'NewTimeTableInLineup',
            exclude: ['id'],
            optional: ['lineupId'],
          }),
        },
      },
    })
    timeTable: Omit<TimeTable, 'id'>,
  ): Promise<TimeTable> {
    return this.lineupRepository.timeTables(id).create(timeTable);
  }

  @patch('/lineups/{id}/time-tables', {
    responses: {
      '200': {
        description: 'Lineup.TimeTable PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TimeTable, {partial: true}),
        },
      },
    })
    timeTable: Partial<TimeTable>,
    @param.query.object('where', getWhereSchemaFor(TimeTable))
    where?: Where<TimeTable>,
  ): Promise<Count> {
    return this.lineupRepository.timeTables(id).patch(timeTable, where);
  }

  @del('/lineups/{id}/time-tables', {
    responses: {
      '200': {
        description: 'Lineup.TimeTable DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(TimeTable))
    where?: Where<TimeTable>,
  ): Promise<Count> {
    return this.lineupRepository.timeTables(id).delete(where);
  }
}
