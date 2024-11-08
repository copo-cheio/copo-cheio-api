import {Getter,inject} from "@loopback/core";
import {
  BelongsToAccessor,
  HasManyRepositoryFactory,
  HasManyThroughRepositoryFactory,
  HasOneRepositoryFactory,
  ReferencesManyAccessor,
  repository,
} from "@loopback/repository";
import {SoftCrudRepository} from "loopback4-soft-delete";
import {PostgresSqlDataSource} from "../datasources";
import {
  Address,
  Balcony,

  Contacts,
  Event,
  Image,
  OpeningHours,
  Place,
  PlaceRelations,
  PlaceRule,
  Playlist,
  Rule,
  Schedule,
  Tag,
  Team,
} from "../models";
import {AddressRepository} from "./address.repository";
import {BalconyRepository} from "./balcony.repository";
// import { CompanyRepository } from "./company.repository";
import {ContactsRepository} from "./contacts.repository";
import {EventRepository} from "./event.repository";
import {ImageRepository} from "./image.repository";
import {OpeningHoursRepository} from "./opening-hours.repository";
import {PlaceRuleRepository} from "./place-rule.repository";
import {PlaylistRepository} from "./playlist.repository";
import {RuleRepository} from "./rule.repository";
import {ScheduleRepository} from "./schedule.repository";
import {TagRepository} from "./tag.repository";
import {TeamRepository} from "./team.repository";

/**
  {
    "id": "a813bc90-d422-4d60-aa48-1e7d6c69ae8e",
    "name": "Test place",
    "description": "description",
    "coverId": "c7082619-a902-4682-8b48-68ad59c33e3c",
    "addressId": "addressid"
  }
*/
export class PlaceRepository extends SoftCrudRepository<
  Place,
  typeof Place.prototype.id,
  PlaceRelations
> {
  public readonly balconies: HasManyRepositoryFactory<
    Balcony,
    typeof Place.prototype.id
  >;
  public readonly cover: BelongsToAccessor<Image, typeof Balcony.prototype.id>;

  public readonly address: BelongsToAccessor<
    Address,
    typeof Place.prototype.id
  >;

  public readonly schedule: BelongsToAccessor<
    Schedule,
    typeof Place.prototype.id
  >;

  public readonly events: HasManyRepositoryFactory<
    Event,
    typeof Place.prototype.id
  >;

  public readonly playlist: BelongsToAccessor<
    Playlist,
    typeof Place.prototype.id
  >;

  public readonly rules: HasManyThroughRepositoryFactory<
    Rule,
    typeof Rule.prototype.id,
    PlaceRule,
    typeof Place.prototype.id
  >;

  public readonly tags: ReferencesManyAccessor<Tag, typeof Place.prototype.id>;

  public readonly openingHours: HasManyRepositoryFactory<
    OpeningHours,
    typeof Place.prototype.id
  >;

  public readonly gallery: HasManyRepositoryFactory<
    Image,
    typeof Place.prototype.id
  >;

  public readonly contacts: HasOneRepositoryFactory<
    Contacts,
    typeof Place.prototype.id
  >;

  public readonly team: BelongsToAccessor<Team, typeof Place.prototype.id>;

  // public readonly company: BelongsToAccessor<Company, typeof Place.prototype.id>;
  // public readonly tags: ReferencesManyAccessor<Tag, typeof Artist.prototype.id>;

  constructor(
    @inject("datasources.PostgresSql") dataSource: PostgresSqlDataSource,
    @repository.getter("BalconyRepository")
    protected balconyRepositoryGetter: Getter<BalconyRepository>,
    @repository.getter("ImageRepository")
    protected imageRepositoryGetter: Getter<ImageRepository>,
    @repository.getter("AddressRepository")
    protected addressRepositoryGetter: Getter<AddressRepository>,
    @repository.getter("ScheduleRepository")
    protected scheduleRepositoryGetter: Getter<ScheduleRepository>,

    @repository.getter("EventRepository")
    protected eventRepositoryGetter: Getter<EventRepository>,
    @repository.getter("PlaylistRepository")
    protected playlistRepositoryGetter: Getter<PlaylistRepository>,
    @repository.getter("PlaceRuleRepository")
    protected placeRuleRepositoryGetter: Getter<PlaceRuleRepository>,
    @repository.getter("RuleRepository")
    protected ruleRepositoryGetter: Getter<RuleRepository>,
    @repository.getter("TagRepository")
    protected tagRepositoryGetter: Getter<TagRepository>,
    @repository.getter("OpeningHoursRepository")
    protected openingHoursRepositoryGetter: Getter<OpeningHoursRepository>,
    @repository.getter("ContactsRepository")
    protected contactsRepositoryGetter: Getter<ContactsRepository>,
    @repository.getter("TeamRepository")
    protected teamRepositoryGetter: Getter<TeamRepository>
  ) {
    super(Place, dataSource);

    this.team = this.createBelongsToAccessorFor("team", teamRepositoryGetter);
    this.registerInclusionResolver("team", this.team.inclusionResolver);
    this.contacts = this.createHasOneRepositoryFactoryFor(
      "contacts",
      contactsRepositoryGetter
    );
    this.registerInclusionResolver("contacts", this.contacts.inclusionResolver);
    this.gallery = this.createHasManyRepositoryFactoryFor(
      "gallery",
      imageRepositoryGetter
    );

    this.registerInclusionResolver(
      "gallery",
      async (entities, inclusion, options) => {
        const result = await this.gallery.inclusionResolver(
          entities,
          {
            // @ts-ignore
            ...inclusion,
            scope: {
              where: {
                type: "gallery",
              },
            },
          },
          options
        );
        return result;
      }
    );

    // this.registerInclusionResolver("gallery", this.gallery.inclusionResolver);
    this.openingHours = this.createHasManyRepositoryFactoryFor(
      "openingHours",
      openingHoursRepositoryGetter
    );
    this.registerInclusionResolver(
      "openingHours",
      this.openingHours.inclusionResolver
    );
    this.tags = this.createReferencesManyAccessorFor(
      "tags",
      tagRepositoryGetter
    );
    this.registerInclusionResolver("tags", this.tags.inclusionResolver);
    this.rules = this.createHasManyThroughRepositoryFactoryFor(
      "rules",
      ruleRepositoryGetter,
      placeRuleRepositoryGetter
    );
    this.registerInclusionResolver("rules", this.rules.inclusionResolver);
    this.playlist = this.createBelongsToAccessorFor(
      "playlist",
      playlistRepositoryGetter
    );
    this.registerInclusionResolver("playlist", this.playlist.inclusionResolver);
    this.events = this.createHasManyRepositoryFactoryFor(
      "events",
      eventRepositoryGetter
    );
    this.registerInclusionResolver("events", this.events.inclusionResolver);

    this.schedule = this.createBelongsToAccessorFor(
      "schedule",
      scheduleRepositoryGetter
    );
    this.registerInclusionResolver("schedule", this.schedule.inclusionResolver);
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
    this.balconies = this.createHasManyRepositoryFactoryFor(
      "balconies",
      balconyRepositoryGetter
    );
    this.registerInclusionResolver(
      "balconies",
      this.balconies.inclusionResolver
    );

    (this.modelClass as any).observe("persist", async (ctx: any) => {
      ctx.data.updated_at = new Date();
    });
  }

  async findByDistance(lat: number, lon: number): Promise<Place[]> {
    const sql = `
      SELECT p.*, 
             ( 6371 * acos( cos( radians(${lat}) ) 
             * cos( radians( a.latitude ) ) 
             * cos( radians( a.longitude ) - radians(${lon}) ) 
             + sin( radians(${lat}) ) 
             * sin( radians( a.latitude ) ) ) ) AS distance 
      FROM place p
      JOIN address a ON p.addressid = a.id::text
      ORDER BY distance;
    `;

    return this.dataSource.execute(sql);
  }

  public async findGalleryImages(
    productId: string,
    filter?: any
  ): Promise<Image[]> {
    return this.gallery(productId).find({
      where: {
        type: "gallery",
        ...filter?.where,
      },
      ...filter,
    });
  }
}
