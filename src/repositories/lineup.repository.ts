import {Getter,inject} from '@loopback/core';
import {BelongsToAccessor,HasManyRepositoryFactory,repository} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {PostgresSqlDataSource} from '../datasources';
import {Event,Lineup,LineUpArtist,LineupRelations, TimeTable} from '../models';
import {EventRepository} from './event.repository';
import {LineUpArtistRepository} from './line-up-artist.repository';
import {TimeTableRepository} from './time-table.repository';

export class LineupRepository extends SoftCrudRepository<
  Lineup,
  typeof Lineup.prototype.id,
  LineupRelations
> {

  public readonly lineUpArtists: HasManyRepositoryFactory<LineUpArtist, typeof Lineup.prototype.id>;

  public readonly event: BelongsToAccessor<Event, typeof Lineup.prototype.id>;

  public readonly timeTables: HasManyRepositoryFactory<TimeTable, typeof Lineup.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('LineUpArtistRepository') protected lineUpArtistRepositoryGetter: Getter<LineUpArtistRepository>, @repository.getter('EventRepository') protected eventRepositoryGetter: Getter<EventRepository>, @repository.getter('TimeTableRepository') protected timeTableRepositoryGetter: Getter<TimeTableRepository>,
  ) {
    super(Lineup, dataSource);
    this.timeTables = this.createHasManyRepositoryFactoryFor('timeTables', timeTableRepositoryGetter,);
    this.registerInclusionResolver('timeTables', this.timeTables.inclusionResolver);
    this.event = this.createBelongsToAccessorFor('event', eventRepositoryGetter,);
    this.registerInclusionResolver('event', this.event.inclusionResolver);
    this.lineUpArtists = this.createHasManyRepositoryFactoryFor('lineUpArtists', lineUpArtistRepositoryGetter,);
    this.registerInclusionResolver('lineUpArtists', this.lineUpArtists.inclusionResolver);
  }
}
