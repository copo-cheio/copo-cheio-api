import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SqliteDbDataSource} from '../datasources';
import {BaseModel,BaseModelRelations} from '../models';

export class BaseModelRepository extends DefaultCrudRepository<
  BaseModel,
  typeof BaseModel.prototype.id,
  BaseModelRelations
> {
  constructor(
    @inject('datasources.SqliteDb') dataSource: SqliteDbDataSource,
  ) {
    super(BaseModel, dataSource);
    (this.modelClass as any).observe('persist', async (ctx: any) => {
      ctx.data.updated_at = new Date();
    });

  }
}
