// // src/repositories/auditing.repository.base.ts
// import {
//   DefaultCrudRepository,
//   Entity,
//   juggler
// } from '@loopback/repository';

// export class BlueprintRepository<
//   T extends Entity,
//   ID,
//   Relations extends object = {}
// > extends SoftCrudRepository<T, ID, Relations> {
//   // put the shared code here
//   constructor(
//     entityClass: typeof Entity & {prototype: T},
//     dataSource: juggler.DataSource,
//   ) {
//     super(entityClass, dataSource);
//   }
//   // constructor(entityClass:typeof Entity & {prototype:T}, @inject("datasources.PostgresSql") dataSource: PostgresSqlDataSource){
//   //   super(entityClass,dataSource)
//   // }
// }
