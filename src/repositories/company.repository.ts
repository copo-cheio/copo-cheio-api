import {Getter,inject} from "@loopback/core";
import {
  BelongsToAccessor,
  HasManyRepositoryFactory,
  HasOneRepositoryFactory,
  // ReferencesManyAccessor,
  repository,
} from "@loopback/repository";
import {SoftCrudRepository} from "loopback4-soft-delete";
import {PostgresSqlDataSource} from "../datasources";
import {
  Company,
  CompanyRelations,
  Contacts,
  Event,
  Image,
  Team, Place} from "../models";
import {ContactsRepository} from "./contacts.repository";
import {EventRepository} from "./event.repository";
import {ImageRepository} from "./image.repository";
// import {PlaceRepository} from "./place.repository";
import {TeamRepository} from "./team.repository";
import {PlaceRepository} from './place.repository';

export class CompanyRepository extends SoftCrudRepository<
  Company,
  typeof Company.prototype.id,
  CompanyRelations
> {
  // public readonly staffs: ReferencesManyAccessor<Staff, typeof Company.prototype.id>;

  public readonly contacts: HasOneRepositoryFactory<
    Contacts,
    typeof Company.prototype.id
  >;

  public readonly cover: BelongsToAccessor<Image, typeof Company.prototype.id>;


  // public readonly staffMembers: HasManyRepositoryFactory<Staff, typeof Company.prototype.id>;
  public readonly places: HasManyRepositoryFactory<Place, typeof Company.prototype.id>;
  public readonly teams: HasManyRepositoryFactory<
    Team,
    typeof Company.prototype.id
  >;

  public readonly events: HasManyRepositoryFactory<
    Event,
    typeof Company.prototype.id
  >;

  // public readonly previousPlaces: ReferencesManyAccessor<
  //   Place,
  //   typeof Company.prototype.id
  // >;

  constructor(
    @inject("datasources.PostgresSql") dataSource: PostgresSqlDataSource,
    // @repository.getter("StaffRepository")
    // protected staffRepositoryGetter: Getter<StaffRepository>,
    @repository.getter("ContactsRepository")
    protected contactsRepositoryGetter: Getter<ContactsRepository>,
    @repository.getter("ImageRepository")
    protected imageRepositoryGetter: Getter<ImageRepository>,
    @repository.getter("TeamRepository")
    protected teamRepositoryGetter: Getter<TeamRepository>,
    @repository.getter("EventRepository")
    protected eventRepositoryGetter: Getter<EventRepository>, @repository.getter('PlaceRepository') protected placeRepositoryGetter: Getter<PlaceRepository>,
  ) {
    super(Company, dataSource);
    this.places = this.createHasManyRepositoryFactoryFor('places', placeRepositoryGetter,);
    this.registerInclusionResolver('places', this.places.inclusionResolver);

    this.events = this.createHasManyRepositoryFactoryFor(
      "events",
      eventRepositoryGetter
    );
    this.registerInclusionResolver("events", this.events.inclusionResolver);
    this.teams = this.createHasManyRepositoryFactoryFor(
      "teams",
      teamRepositoryGetter
    );
    this.registerInclusionResolver("teams", this.teams.inclusionResolver);
    // this.staffMembers = this.createHasManyRepositoryFactoryFor('staffMembers', staffRepositoryGetter,);
    // this.registerInclusionResolver('staffMembers', this.staffMembers.inclusionResolver);
    this.cover = this.createBelongsToAccessorFor(
      "cover",
      imageRepositoryGetter
    );
    this.registerInclusionResolver("cover", this.cover.inclusionResolver);
    this.contacts = this.createHasOneRepositoryFactoryFor(
      "contacts",
      contactsRepositoryGetter
    );
    this.registerInclusionResolver("contacts", this.contacts.inclusionResolver);
    // this.staffs = this.createReferencesManyAccessorFor('staffs', staffRepositoryGetter,);
    // this.registerInclusionResolver('staffs', this.staffs.inclusionResolver);
  }
}
