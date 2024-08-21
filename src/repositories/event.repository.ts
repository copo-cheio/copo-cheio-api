import {Getter,inject} from '@loopback/core';
import {BelongsToAccessor,DefaultCrudRepository,HasManyThroughRepositoryFactory,repository, HasManyRepositoryFactory} from '@loopback/repository';
import {SqliteDbDataSource} from '../datasources';
import {Event,EventRelations,Image,Tag,TagReferences, Address, Place, Schedule, Ticket, Rule, EventRule} from '../models';
import {ImageRepository} from './image.repository';
import {TagReferencesRepository} from './tag-relations.repository';
import {TagRepository} from './tag.repository';
import {AddressRepository} from './address.repository';
import {PlaceRepository} from './place.repository';
import {ScheduleRepository} from './schedule.repository';
import {TicketRepository} from './ticket.repository';
import {EventRuleRepository} from './event-rule.repository';
import {RuleRepository} from './rule.repository';

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

  constructor(
    @inject('datasources.SqliteDb') dataSource: SqliteDbDataSource, @repository.getter('ImageRepository') protected imageRepositoryGetter: Getter<ImageRepository>, @repository.getter('TagReferencesRepository') protected tagRelationsRepositoryGetter: Getter<TagReferencesRepository>, @repository.getter('TagRepository') protected tagRepositoryGetter: Getter<TagRepository>, @repository.getter('AddressRepository') protected addressRepositoryGetter: Getter<AddressRepository>, @repository.getter('PlaceRepository') protected placeRepositoryGetter: Getter<PlaceRepository>, @repository.getter('ScheduleRepository') protected scheduleRepositoryGetter: Getter<ScheduleRepository>, @repository.getter('TicketRepository') protected ticketRepositoryGetter: Getter<TicketRepository>, @repository.getter('EventRuleRepository') protected eventRuleRepositoryGetter: Getter<EventRuleRepository>, @repository.getter('RuleRepository') protected ruleRepositoryGetter: Getter<RuleRepository>,
  ) {
    super(Event, dataSource);
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
}
