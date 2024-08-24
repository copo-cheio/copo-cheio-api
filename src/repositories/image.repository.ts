import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresSqlDataSource} from '../datasources';
import {Image,ImageRelations} from '../models';

export class ImageRepository extends DefaultCrudRepository<
  Image,
  typeof Image.prototype.id,
  ImageRelations
> {
  constructor(
    @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,
  ) {
    super(Image, dataSource);

    (this.modelClass as any).observe('persist', async (ctx: any) => {
      ctx.data.updated_at = new Date();
    });
  }
}
