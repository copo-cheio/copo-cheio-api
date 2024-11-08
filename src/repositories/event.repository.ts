import {Getter,inject} from "@loopback/core";
import {
  BelongsToAccessor,
  HasManyRepositoryFactory,
  HasManyThroughRepositoryFactory,
  HasOneRepositoryFactory,
  ReferencesManyAccessor,
  repository
} from "@loopback/repository";
import {PostgresSqlDataSource} from "../datasources";
import {
  Address,
  Event,
  EventInstance,
  EventRelations,
  EventRule,
  Image,
  Lineup,
  OpeningHours,
  Place,
  Playlist,
  RecurringSchedule,
  Rule,
  Schedule,
  Tag,
  Ticket, Contacts, Team} from "../models";
import {AddressRepository} from "./address.repository";
import {EventRuleRepository} from "./event-rule.repository";
import {ImageRepository} from "./image.repository";
import {LineupRepository} from "./lineup.repository";
import {PlaceRepository} from "./place.repository";
import {PlaylistRepository} from "./playlist.repository";
import {RuleRepository} from "./rule.repository";
import {ScheduleRepository} from "./schedule.repository";
// import {TagReferencesRepository} from "./tag-references.repository";
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {EventInstanceRepository} from './event-instance.repository';
import {OpeningHoursRepository} from './opening-hours.repository';
import {RecurringScheduleRepository} from './recurring-schedule.repository';
import {TagRepository} from "./tag.repository";
import {TicketRepository} from "./ticket.repository";
import {ContactsRepository} from './contacts.repository';
import {TeamRepository} from './team.repository';

export class EventRepository extends SoftCrudRepository<
  Event,
  typeof Event.prototype.id,
  EventRelations
> {
  public readonly cover: BelongsToAccessor<Image, typeof Event.prototype.id>;

  public readonly address: BelongsToAccessor<
    Address,
    typeof Event.prototype.id
  >;

  public readonly place: BelongsToAccessor<Place, typeof Event.prototype.id>;

  public readonly schedule: BelongsToAccessor<
    Schedule,
    typeof Event.prototype.id
  >;

  public readonly tickets: HasManyRepositoryFactory<
    Ticket,
    typeof Event.prototype.id
  >;

  public readonly rules: HasManyThroughRepositoryFactory<
    Rule,
    typeof Rule.prototype.id,
    EventRule,
    typeof Event.prototype.id
  >;

  public readonly playlist: BelongsToAccessor<
    Playlist,
    typeof Event.prototype.id
  >;

  public readonly lineups: HasManyRepositoryFactory<
    Lineup,
    typeof Event.prototype.id
  >;

  public readonly tags: ReferencesManyAccessor<Tag, typeof Event.prototype.id>;

  public readonly openingHours: HasManyRepositoryFactory<OpeningHours, typeof Event.prototype.id>;

  public readonly gallery: HasManyRepositoryFactory<Image, typeof Event.prototype.id>;

  public readonly instances: HasManyRepositoryFactory<EventInstance, typeof Event.prototype.id>;

  public readonly recurringSchedule: HasOneRepositoryFactory<RecurringSchedule, typeof Event.prototype.id>;

  public readonly contacts: HasOneRepositoryFactory<Contacts, typeof Event.prototype.id>;

  public readonly team: BelongsToAccessor<Team, typeof Event.prototype.id>;

  constructor(
    @inject("datasources.PostgresSql") dataSource: PostgresSqlDataSource,
    @repository.getter("ImageRepository")
    protected imageRepositoryGetter: Getter<ImageRepository>,
    // @repository.getter("TagReferencesRepository")
    // protected tagRelationsRepositoryGetter: Getter<TagReferencesRepository>,
    @repository.getter("TagRepository")
    protected tagRepositoryGetter: Getter<TagRepository>,
    @repository.getter("AddressRepository")
    protected addressRepositoryGetter: Getter<AddressRepository>,
    @repository.getter("PlaceRepository")
    protected placeRepositoryGetter: Getter<PlaceRepository>,
    @repository.getter("ScheduleRepository")
    protected scheduleRepositoryGetter: Getter<ScheduleRepository>,
    @repository.getter("TicketRepository")
    protected ticketRepositoryGetter: Getter<TicketRepository>,
    @repository.getter("EventRuleRepository")
    protected eventRuleRepositoryGetter: Getter<EventRuleRepository>,
    @repository.getter("RuleRepository")
    protected ruleRepositoryGetter: Getter<RuleRepository>,
    @repository.getter("PlaylistRepository")
    protected playlistRepositoryGetter: Getter<PlaylistRepository>,
    @repository.getter("LineupRepository")
    protected lineupRepositoryGetter: Getter<LineupRepository>, @repository.getter('OpeningHoursRepository') protected openingHoursRepositoryGetter: Getter<OpeningHoursRepository>, @repository.getter('EventInstanceRepository') protected eventInstanceRepositoryGetter: Getter<EventInstanceRepository>, @repository.getter('RecurringScheduleRepository') protected recurringScheduleRepositoryGetter: Getter<RecurringScheduleRepository>, @repository.getter('ContactsRepository') protected contactsRepositoryGetter: Getter<ContactsRepository>, @repository.getter('TeamRepository') protected teamRepositoryGetter: Getter<TeamRepository>,
  ) {
    super(Event, dataSource);
    this.team = this.createBelongsToAccessorFor('team', teamRepositoryGetter,);
    this.registerInclusionResolver('team', this.team.inclusionResolver);
    this.contacts = this.createHasOneRepositoryFactoryFor('contacts', contactsRepositoryGetter);
    this.registerInclusionResolver('contacts', this.contacts.inclusionResolver);
    this.recurringSchedule = this.createHasOneRepositoryFactoryFor('recurringSchedule', recurringScheduleRepositoryGetter);
    this.registerInclusionResolver('recurringSchedule', this.recurringSchedule.inclusionResolver);
    this.instances = this.createHasManyRepositoryFactoryFor('instances', eventInstanceRepositoryGetter,);
    this.registerInclusionResolver('instances', this.instances.inclusionResolver);
    this.gallery = this.createHasManyRepositoryFactoryFor('gallery', imageRepositoryGetter,);
    this.registerInclusionResolver('gallery', this.gallery.inclusionResolver);
    this.openingHours = this.createHasManyRepositoryFactoryFor('openingHours', openingHoursRepositoryGetter,);
    this.registerInclusionResolver('openingHours', this.openingHours.inclusionResolver);
    this.tags = this.createReferencesManyAccessorFor(
      "tags",
      tagRepositoryGetter
    );
    this.registerInclusionResolver("tags", this.tags.inclusionResolver);
    this.lineups = this.createHasManyRepositoryFactoryFor(
      "lineups",
      lineupRepositoryGetter
    );
    this.registerInclusionResolver("lineups", this.lineups.inclusionResolver);
    this.playlist = this.createBelongsToAccessorFor(
      "playlist",
      playlistRepositoryGetter
    );
    this.registerInclusionResolver("playlist", this.playlist.inclusionResolver);
    this.rules = this.createHasManyThroughRepositoryFactoryFor(
      "rules",
      ruleRepositoryGetter,
      eventRuleRepositoryGetter
    );
    this.registerInclusionResolver("rules", this.rules.inclusionResolver);
    this.tickets = this.createHasManyRepositoryFactoryFor(
      "tickets",
      ticketRepositoryGetter
    );
    this.registerInclusionResolver("tickets", this.tickets.inclusionResolver);
    this.schedule = this.createBelongsToAccessorFor(
      "schedule",
      scheduleRepositoryGetter
    );
    this.registerInclusionResolver("schedule", this.schedule.inclusionResolver);
    this.place = this.createBelongsToAccessorFor(
      "place",
      placeRepositoryGetter
    );
    this.registerInclusionResolver("place", this.place.inclusionResolver);
    this.address = this.createBelongsToAccessorFor(
      "address",
      addressRepositoryGetter
    );
    this.registerInclusionResolver("address", this.address.inclusionResolver);

    this.cover = this.createBelongsToAccessorFor(
      "cover",
      imageRepositoryGetter
    );
    this.registerInclusionResolver("cover", this.cover.inclusionResolver);

    // (this.modelClass as any).observe('persist', async (ctx: any) => {
    //   //  delete ctx.data.endDate;
    //   //  delete ctx.data.scheduleType;

    //   if(ctx.type == ScheduleTypes[1]){
    //     ctx.endDate = new Date('3141/01/01')
    //   }else{
    //     if(ctx.scheduleId){
    //       const result = await this.execute('select datetime from datetime where datetime.scheduleid = $1 ORDER BY datetime DESC LIMIT 1 ',[ctx.scheduleId])

    //       console.log({result});
    //       ctx.endDate= new Date()
    //     }else{
    //       ctx.endDate= new Date('1900/01/01')
    //     }
    //   }
    //  });
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
