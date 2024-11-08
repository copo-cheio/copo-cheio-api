import {Getter,inject} from "@loopback/core";
import {
  HasManyRepositoryFactory,
  HasManyThroughRepositoryFactory,
  repository,
} from "@loopback/repository";
import {PostgresSqlDataSource} from "../datasources";
import {Event,Place,Staff,Team,TeamRelations,TeamStaff} from "../models";
import {BaseRepository} from "./base.repository.base";
// import {CompanyRepository} from './company.repository';
import {EventRepository} from "./event.repository";
import {PlaceRepository} from "./place.repository";
import {StaffRepository} from "./staff.repository";
import {TeamStaffRepository} from "./team-staff.repository";

export class TeamRepository extends BaseRepository<
  Team,
  typeof Team.prototype.id,
  TeamRelations
> {
  public readonly staff: HasManyThroughRepositoryFactory<
    Staff,
    typeof Staff.prototype.id,
    TeamStaff,
    typeof Team.prototype.id
  >;

  public readonly events: HasManyRepositoryFactory<
    Event,
    typeof Team.prototype.id
  >;

  public readonly places: HasManyRepositoryFactory<
    Place,
    typeof Team.prototype.id
  >;

  public readonly teamStaffs: HasManyRepositoryFactory<TeamStaff, typeof Team.prototype.id>;
  // public readonly company: BelongsToAccessor<Company, typeof Team.prototype.id>;

  constructor(
    @inject("datasources.PostgresSql") dataSource: PostgresSqlDataSource,
    // @inject.getter(AuthenticationBindings.CURRENT_USER,{optional:true})
    // public readonly getCurrentUser: Getter<any>,
    @repository.getter("TeamStaffRepository")
    protected teamStaffRepositoryGetter: Getter<TeamStaffRepository>,
    @repository.getter("StaffRepository")
    protected staffRepositoryGetter: Getter<StaffRepository>,
    @repository.getter("EventRepository")
    protected eventRepositoryGetter: Getter<EventRepository>,
    @repository.getter("PlaceRepository")
    protected placeRepositoryGetter: Getter<PlaceRepository>
  ) //  @repository.getter('CompanyRepository') protected companyRepositoryGetter: Getter<CompanyRepository>,

  {
    super(Team, dataSource);
    this.teamStaffs = this.createHasManyRepositoryFactoryFor('teamStaffs', teamStaffRepositoryGetter,);
    this.registerInclusionResolver('teamStaffs', this.teamStaffs.inclusionResolver);
    // this.company = this.createBelongsToAccessorFor('company', companyRepositoryGetter,);
    // this.registerInclusionResolver('company', this.company.inclusionResolver);
    this.places = this.createHasManyRepositoryFactoryFor(
      "places",
      placeRepositoryGetter
    );
    this.registerInclusionResolver("places", this.places.inclusionResolver);
    this.events = this.createHasManyRepositoryFactoryFor(
      "events",
      eventRepositoryGetter
    );
    this.registerInclusionResolver("events", this.events.inclusionResolver);
    this.staff = this.createHasManyThroughRepositoryFactoryFor(
      "staff",
      staffRepositoryGetter,
      teamStaffRepositoryGetter
    );
    this.registerInclusionResolver("staff", this.staff.inclusionResolver);
  }
}
