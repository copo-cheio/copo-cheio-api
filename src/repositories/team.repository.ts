import {Getter,inject} from '@loopback/core';
import {HasManyThroughRepositoryFactory,repository} from '@loopback/repository';
import {PostgresSqlDataSource} from "../datasources";
import {Staff,Team,TeamRelations,TeamStaff} from '../models';
import {BaseRepository} from './base.repository.base';
import {StaffRepository} from './staff.repository';
import {TeamStaffRepository} from './team-staff.repository';

export class TeamRepository extends BaseRepository<
  Team,
  typeof Team.prototype.id,
  TeamRelations
> {

  public readonly staff: HasManyThroughRepositoryFactory<Staff, typeof Staff.prototype.id,
          TeamStaff,
          typeof Team.prototype.id
        >;

  constructor(

    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    // @inject.getter(AuthenticationBindings.CURRENT_USER,{optional:true})
    // public readonly getCurrentUser: Getter<any>,
    @repository.getter('TeamStaffRepository') protected teamStaffRepositoryGetter: Getter<TeamStaffRepository>,
    @repository.getter('StaffRepository') protected staffRepositoryGetter: Getter<StaffRepository>

  ) {
    super(Team, dataSource);
    this.staff = this.createHasManyThroughRepositoryFactoryFor('staff', staffRepositoryGetter, teamStaffRepositoryGetter,);
    this.registerInclusionResolver('staff', this.staff.inclusionResolver);
  }
}
