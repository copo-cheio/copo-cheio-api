import {Getter,inject} from '@loopback/core';
import {BelongsToAccessor,DefaultCrudRepository,HasManyRepositoryFactory,HasManyThroughRepositoryFactory,repository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {Address,Event,EventRelations,EventRule,Image,Place,Playlist,Rule,Schedule,Tag,TagReferences,Ticket, Lineup} from '../models';
import {AddressRepository} from './address.repository';
import {EventRuleRepository} from './event-rule.repository';
import {ImageRepository} from './image.repository';
import {PlaceRepository} from './place.repository';
import {PlaylistRepository} from './playlist.repository';
import {RuleRepository} from './rule.repository';
import {ScheduleRepository} from './schedule.repository';
import {TagReferencesRepository} from './tag-references.repository';
import {TagRepository} from './tag.repository';
import {TicketRepository} from './ticket.repository';
import {LineupRepository} from './lineup.repository';

export class EventRepository extends DefaultCrudRepository<
  Event,
  typeof Event.prototype.id,
  EventRelations
> {

  public readonly cover: BelongsToAccessor<Image, typeof Event.prototype.id>;

  public readonly tags: HasManyThroughRepositoryFactory<Tag, typeof Tag.prototype.id,
  TagReferences,
          typeof Event.prototype.id
        >;

  public readonly address: BelongsToAccessor<Address, typeof Event.prototype.id>;

  public readonly place: BelongsToAccessor<Place, typeof Event.prototype.id>;

  public readonly schedule: BelongsToAccessor<Schedule, typeof Event.prototype.id>;

  public readonly tickets: HasManyRepositoryFactory<Ticket, typeof Event.prototype.id>;

  public readonly rules: HasManyThroughRepositoryFactory<Rule, typeof Rule.prototype.id,
          EventRule,
          typeof Event.prototype.id
        >;

  public readonly playlist: BelongsToAccessor<Playlist, typeof Event.prototype.id>;

  public readonly lineups: HasManyRepositoryFactory<Lineup, typeof Event.prototype.id>;

  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource, @repository.getter('ImageRepository') protected imageRepositoryGetter: Getter<ImageRepository>, @repository.getter('TagReferencesRepository') protected tagRelationsRepositoryGetter: Getter<TagReferencesRepository>, @repository.getter('TagRepository') protected tagRepositoryGetter: Getter<TagRepository>, @repository.getter('AddressRepository') protected addressRepositoryGetter: Getter<AddressRepository>, @repository.getter('PlaceRepository') protected placeRepositoryGetter: Getter<PlaceRepository>, @repository.getter('ScheduleRepository') protected scheduleRepositoryGetter: Getter<ScheduleRepository>, @repository.getter('TicketRepository') protected ticketRepositoryGetter: Getter<TicketRepository>, @repository.getter('EventRuleRepository') protected eventRuleRepositoryGetter: Getter<EventRuleRepository>, @repository.getter('RuleRepository') protected ruleRepositoryGetter: Getter<RuleRepository>, @repository.getter('PlaylistRepository') protected playlistRepositoryGetter: Getter<PlaylistRepository>, @repository.getter('LineupRepository') protected lineupRepositoryGetter: Getter<LineupRepository>,
  ) {
    super(Event, dataSource);
    this.lineups = this.createHasManyRepositoryFactoryFor('lineups', lineupRepositoryGetter,);
    this.registerInclusionResolver('lineups', this.lineups.inclusionResolver);
    this.playlist = this.createBelongsToAccessorFor('playlist', playlistRepositoryGetter,);
    this.registerInclusionResolver('playlist', this.playlist.inclusionResolver);
    this.rules = this.createHasManyThroughRepositoryFactoryFor('rules', ruleRepositoryGetter, eventRuleRepositoryGetter,);
    this.registerInclusionResolver('rules', this.rules.inclusionResolver);
    this.tickets = this.createHasManyRepositoryFactoryFor('tickets', ticketRepositoryGetter,);
    this.registerInclusionResolver('tickets', this.tickets.inclusionResolver);
    this.schedule = this.createBelongsToAccessorFor('schedule', scheduleRepositoryGetter,);
    this.registerInclusionResolver('schedule', this.schedule.inclusionResolver);
    this.place = this.createBelongsToAccessorFor('place', placeRepositoryGetter,);
    this.registerInclusionResolver('place', this.place.inclusionResolver);
    this.address = this.createBelongsToAccessorFor('address', addressRepositoryGetter,);
    this.registerInclusionResolver('address', this.address.inclusionResolver);
    this.tags = this.createHasManyThroughRepositoryFactoryFor('tags', tagRepositoryGetter, tagRelationsRepositoryGetter,);
    this.registerInclusionResolver('tags', this.tags.inclusionResolver);
    this.cover = this.createBelongsToAccessorFor('cover', imageRepositoryGetter,);
    this.registerInclusionResolver('cover', this.cover.inclusionResolver);
  }

  async findByDistance(lat: number, lon: number): Promise<Place[]> {
    const sql = `
      SELECT p.*, 
             ( 6371 * acos( cos( radians(${lat}) ) 
             * cos( radians( a.latitude ) ) 
             * cos( radians( a.longitude ) - radians(${lon}) ) 
             + sin( radians(${lat}) ) 
             * sin( radians( a.latitude ) ) ) ) AS distance 
      FROM event p
      JOIN address a ON p.addressId = a.id::text
      ORDER BY distance;
    `;

    return this.dataSource.execute(sql);
  }

}
