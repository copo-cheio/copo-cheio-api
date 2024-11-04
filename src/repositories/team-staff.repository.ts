import {AuthenticationBindings} from "@loopback/authentication";
import {Getter,inject} from "@loopback/core";
import {PostgresSqlDataSource} from "../datasources";
import {TeamStaff,TeamStaffRelations} from "../models";
import {BaseRepository} from "./base.repository.base";

export class TeamStaffRepository extends BaseRepository<
  TeamStaff,
  typeof TeamStaff.prototype.id,
  TeamStaffRelations
> {
  constructor(
    @inject("datasources.PostgresSql") dataSource: PostgresSqlDataSource,

    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public readonly getCurrentUser: Getter<any>
  ) {
    super(TeamStaff, dataSource, getCurrentUser);
  }
}
