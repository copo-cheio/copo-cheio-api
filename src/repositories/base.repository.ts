// import {inject, Getter} from '@loopback/core';
// import {DefaultCrudRepository, repository, HasManyRepositoryFactory, BelongsToAccessor, Entity} from '@loopback/repository';
// import {PostgresSqlDataSource} from '../datasources';


// export class BaseRepository<
//   T extends Entity,
//   ID,
//   Relations extends object = {}
// > extends DefaultCrudRepository<T, ID, Relations> {
//   // put the shared code here

//   constructor(){
//     super(this.entityClass)
//     (this.modelClass as any).observe('persist', async (ctx: any) => {
//       ctx.data.updated_at = new Date();
//     });
//   }
// }
