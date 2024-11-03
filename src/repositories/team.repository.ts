import {AuthenticationBindings} from '@loopback/authentication';
import {Getter,inject} from '@loopback/core';
import {PostgresSqlDataSource} from "../datasources";
import {Team,TeamRelations} from '../models';
import {BaseRepository} from './base.repository.base';

export class TeamRepository extends BaseRepository<
  Team,
  typeof Team.prototype.id,
  TeamRelations
> {
  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,

    @inject.getter(AuthenticationBindings.CURRENT_USER,{optional:true})
     public readonly getCurrentUser?: Getter<any>
  ) {
    super(Team, dataSource,getCurrentUser);
  }
}
