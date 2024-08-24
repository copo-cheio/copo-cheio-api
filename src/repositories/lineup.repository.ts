import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory, BelongsToAccessor} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {Lineup, LineupRelations, LineUpArtist, Event} from '../models';
import {LineUpArtistRepository} from './line-up-artist.repository';
import {EventRepository} from './event.repository';

export class LineupRepository extends DefaultCrudRepository<
  Lineup,
  typeof Lineup.prototype.id,
  LineupRelations
> {

  public readonly lineUpArtists: HasManyRepositoryFactory<LineUpArtist, typeof Lineup.prototype.id>;

  public readonly event: BelongsToAccessor<Event, typeof Lineup.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('LineUpArtistRepository') protected lineUpArtistRepositoryGetter: Getter<LineUpArtistRepository>, @repository.getter('EventRepository') protected eventRepositoryGetter: Getter<EventRepository>,
  ) {
    super(Lineup, dataSource);
    this.event = this.createBelongsToAccessorFor('event', eventRepositoryGetter,);
    this.registerInclusionResolver('event', this.event.inclusionResolver);
    this.lineUpArtists = this.createHasManyRepositoryFactoryFor('lineUpArtists', lineUpArtistRepositoryGetter,);
    this.registerInclusionResolver('lineUpArtists', this.lineUpArtists.inclusionResolver);
  }
}
