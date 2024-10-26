import {AuthenticationBindings} from '@loopback/authentication';
import {Getter,inject} from '@loopback/core';
import {Entity,juggler} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';

export class BaseRepository<
  T extends Entity,
  ID,
  Relations extends object = {}
> extends SoftCrudRepository<T, ID, Relations> {
  constructor(
    entityClass: typeof Entity & {prototype: T},
    dataSource: juggler.DataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    protected readonly getCurrentUser: Getter<any>,
  ) {
    super(entityClass, dataSource);
  }
  async getIdentifier() {
    return this.getCurrentUser()
    // return this.id;
  }
}
// import {
//   DataObject,
//   DefaultCrudRepository,
//   Filter,
//   juggler,
//   Where,
// } from '@loopback/repository';
// import {Count} from '@loopback/repository/src/common-types';
// import {Options} from 'loopback-datasource-juggler';

// import {Base} from '../models';

// export  class BaseRepository<
//   T extends Base,
//   ID,
//   Relations extends object = {}
// > extends SoftCrudRepository<T, ID, Relations> {
//   constructor(
//     entityClass: typeof Base & {
//       prototype: T;
//     },
//     dataSource: juggler.DataSource,
//   ) {
//     super(entityClass, dataSource);
//   }

//   find(filter?: Filter<T>, options?: Options): Promise<(T & Relations)[]> {
//     // Filter out soft deleted entries
//     filter = filter || {};
//     filter.where = filter.where || {};
//     (filter.where as any).deleted = false;

//     // Now call super
//     return super.find(filter, options);
//   }

//   // findOne(filter?: Filter<T>, options?: Options): Promise<T | null> {
//   //   // Filter out soft deleted entries
//   //   filter = filter || {};
//   //   filter.where = filter.where || {};
//   //   (filter.where as any).deleted = false;

//   //   // Now call super
//   //   return super.findOne(filter, options);
//   // }

//   findById(
//     id: ID,
//     filter?: Filter<T>,
//     options?: Options,
//   ): Promise<T & Relations> {
//     // Filter out soft deleted entries
//     filter = filter || {};
//     filter.where = filter.where || {};
//     (filter.where as any).deleted = false;

//     // Now call super
//     return super.findById(id, filter, options);
//   }

//   updateAll(
//     data: DataObject<T>,
//     where?: Where<T>,
//     options?: Options,
//   ): Promise<Count> {
//     // Filter out soft deleted entries
//     where = where || {};
//     (where as any).deleted = false;

//     // Now call super
//     return super.updateAll(data, where, options);
//   }

//   count(where?: Where<T>, options?: Options): Promise<Count> {
//     // Filter out soft deleted entries
//     where = where || {};
//     (where as any).deleted = false;

//     // Now call super
//     return super.count(where, options);
//   }

//   delete(entity: T, options?: Options): Promise<void> {
//     // Do soft delete, no hard delete allowed
//     (entity as any).deleted = true;
//     return super.update(entity, options);
//   }

//   deleteAll(where?: Where<T>, options?: Options): Promise<Count> {
//     // Do soft delete, no hard delete allowed
//     return this.updateAll(
//       {
//         deleted: true,
//       } as any,
//       where,
//       options,
//     );
//   }

//   deleteById(id: ID, options?: Options): Promise<void> {
//     // Do soft delete, no hard delete allowed
//     return super.updateById(
//       id,
//       {
//         deleted: true,
//       } as any,
//       options,
//     );
//   }

//   /**
//    * Method to perform hard delete of entries. Take caution.
//    * @param entity
//    * @param options
//    */
//   deleteHard(entity: T, options?: Options): Promise<void> {
//     // Do hard delete
//     return super.delete(entity, options);
//   }

//   /**
//    * Method to perform hard delete of entries. Take caution.
//    * @param entity
//    * @param options
//    */
//   deleteAllHard(where?: Where<T>, options?: Options): Promise<Count> {
//     // Do hard delete
//     return super.deleteAll(where, options);
//   }

//   /**
//    * Method to perform hard delete of entries. Take caution.
//    * @param entity
//    * @param options
//    */
//   deleteByIdHard(id: ID, options?: Options): Promise<void> {
//     // Do hard delete
//     return super.deleteById(id, options);
//   }
// }
