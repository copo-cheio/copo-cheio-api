import {Getter, inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../../datasources';
import {Image, ImageRelations} from '../../models';
import {BaseRepository} from '../base.repository.base';
import {UserRepository} from './user.repository';

export class ImageRepository extends BaseRepository<
  Image,
  typeof Image.prototype.id,
  ImageRelations
> {
  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Image, dataSource);
  }
}
