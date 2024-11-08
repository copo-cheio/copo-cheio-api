import {AuthenticationBindings} from "@loopback/authentication";
import {Getter,inject} from "@loopback/core";
import {PostgresSqlDataSource} from "../datasources";
import {TeamStaff,TeamStaffRelations, Staff} from "../models";
import {BaseRepository} from "./base.repository.base";
import {repository, BelongsToAccessor} from '@loopback/repository';
import {StaffRepository} from './staff.repository';

export class TeamStaffRepository extends BaseRepository<
  TeamStaff,
  typeof TeamStaff.prototype.id,
  TeamStaffRelations
> {

  public readonly staff: BelongsToAccessor<Staff, typeof TeamStaff.prototype.id>;

  constructor(
    @inject("datasources.PostgresSql") dataSource: PostgresSqlDataSource,

    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public readonly getCurrentUser: Getter<any>, @repository.getter('StaffRepository') protected staffRepositoryGetter: Getter<StaffRepository>,
  ) {
    super(TeamStaff, dataSource, getCurrentUser);
    this.staff = this.createBelongsToAccessorFor('staff', staffRepositoryGetter,);
    this.registerInclusionResolver('staff', this.staff.inclusionResolver);
  }
}
