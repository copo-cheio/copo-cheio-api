import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {LineUpArtist, LineUpArtistRelations, Lineup, Artist, Schedule} from '../models';
import {LineupRepository} from './lineup.repository';
import {ArtistRepository} from './artist.repository';
import {ScheduleRepository} from './schedule.repository';

export class LineUpArtistRepository extends DefaultCrudRepository<
  LineUpArtist,
  typeof LineUpArtist.prototype.id,
  LineUpArtistRelations
> {

  public readonly lineup: BelongsToAccessor<Lineup, typeof LineUpArtist.prototype.id>;

  public readonly artist: BelongsToAccessor<Artist, typeof LineUpArtist.prototype.id>;

  public readonly schedule: BelongsToAccessor<Schedule, typeof LineUpArtist.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('LineupRepository') protected lineupRepositoryGetter: Getter<LineupRepository>, @repository.getter('ArtistRepository') protected artistRepositoryGetter: Getter<ArtistRepository>, @repository.getter('ScheduleRepository') protected scheduleRepositoryGetter: Getter<ScheduleRepository>,
  ) {
    super(LineUpArtist, dataSource);
    this.schedule = this.createBelongsToAccessorFor('schedule', scheduleRepositoryGetter,);
    this.registerInclusionResolver('schedule', this.schedule.inclusionResolver);
    this.artist = this.createBelongsToAccessorFor('artist', artistRepositoryGetter,);
    this.registerInclusionResolver('artist', this.artist.inclusionResolver);
    this.lineup = this.createBelongsToAccessorFor('lineup', lineupRepositoryGetter,);
    this.registerInclusionResolver('lineup', this.lineup.inclusionResolver);
  }
}