import {inject} from '@loopback/core';
import {PostgresSqlDataSource} from '../datasources';

import {SignInV2, SignInV2Relations} from '../models';
import {BaseRepository} from './v1';

export class SignInV2Repository extends BaseRepository<
  SignInV2,
  typeof SignInV2.prototype.id,
  SignInV2Relations
> {
  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
  ) {
    super(SignInV2, dataSource);
  }
}
