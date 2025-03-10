// import {inject} from '@loopback/core';
// import {DefaultCrudRepository} from '@loopback/repository';
// import {PostgresSqlDataSource} from '../datasources';

// import {Base, BaseRelations} from '../models';

// export class BaseRepository extends DefaultCrudRepository<
//   Base,
//   typeof Base.prototype.id,
//   BaseRelations
// > {
//   constructor(
//        @inject('datasources.PostgresSql') dataSource: PostgresSqlDataSource,

//   ) {
//     super(Base, dataSource);
//   }
// }

import {AuthenticationBindings} from '@loopback/authentication';
import {Getter, inject} from '@loopback/core';
import {Entity, juggler} from '@loopback/repository';
import {SoftCrudRepository} from 'loopback4-soft-delete';

export class BaseRepository<
  T extends Entity,
  ID,
  Relations extends object = {},
> extends SoftCrudRepository<T, ID, Relations> {
  constructor(
    entityClass: typeof Entity & {prototype: T},
    dataSource: juggler.DataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    public readonly getCurrentUser?: Getter<any | undefined>,
  ) {
    super(entityClass, dataSource, getCurrentUser);
    // super(entityClass, dataSource,getCurrentUser);
    // this.getCurrentUser = getCurrentUser;
  }

  // Override updateById to set `updatedAt`
  async updateById(id: any, data: any, options?: object): Promise<void> {
    data.updated_at = new Date(); // Set current timestamp
    await super.updateById(id, data, options);
  }

  async getIdentifier() {
    // sconsole.log("identifier");

    try {
      // @ts-ignore
      const cu = await this.getCurrentUser();
      return cu?.id;
    } catch (ex) {
      return new Promise(res => {
        setTimeout(() => {
          res(undefined);
        }, 1);
      });
    }
  }

  async deleteIfExistsById(deleteInstanceId: ID) {
    try {
      await this.deleteById(deleteInstanceId);
    } catch (ex) {
      console.log('instance with id ', deleteInstanceId, 'not found');
    }
  }

  async forceUpdateById(id: ID, data: any) {
    try {
      await this.undoSoftDeleteById(id);
    } catch (ex) {}
    if (data.id) {
      id = data.id;
      delete data.id;
    }

    return this.updateById(id, data);
    // return this.updateAll(data, condition);
  }
}
