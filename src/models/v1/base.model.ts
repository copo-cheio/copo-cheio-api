import {model, property} from '@loopback/repository';
import {SoftDeleteEntity} from 'loopback4-soft-delete';

@model({
  settings: {
    hidden: ['deleted', 'deleted_on', 'deleted_by'],
    // protectedProperties: ['deleted',"deleted_on","deleted_by"],
    // hidden: ['deleted',"deleted_on","deleted_by"],
    // protected: ['deleted',"deleted_on","deleted_by"],
    // strict: false,
  },
})
export class Base extends SoftDeleteEntity {
  constructor(data?: Partial<Base>) {
    super(data);
  }
  // export class Base extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    useDefaultIdType: false,
    postgresql: {
      dataType: 'uuid',
      extension: 'pgcrypto',
      defaultFn: 'gen_random_uuid()', //<---- only this line is different
    },
  })
  id?: string;

  @property({
    type: 'date',
    generated: true,
    jsonSchema: {
      format: 'date-time',
    },
    // defaultFn: 'now',

    // type: 'date',
    default: () => new Date(),
  })
  created_at?: Date;

  @property({
    type: 'date',
    generated: true,
    jsonSchema: {
      format: 'date-time',
    },
    // type: 'date',
    default: () => new Date(),
    // defaultFn: 'now',
  })
  updated_at?: Date;

  getIdentifier() {
    // console.log('getIdentifier',this.currentUser,'cu')
    return this.id; //this?.currentUser?.id;
  }

  // Delete all softDelete info
  toJSON() {
    const instance: any = this.toObject();
    delete instance.deleted; // Remove 'deleted' property
    delete instance.deleted_by; // Remove 'deleted' property
    delete instance.deleted_on; // Remove 'deleted' property
    delete instance.deletedBy; // Remove 'deleted' property
    delete instance.deletedOn; // Remove 'deleted' property

    // Remove 'deleted' from all included relations as well
    for (const relation in instance) {
      if (Array.isArray(instance[relation])) {
        instance[relation] = instance[relation].map((item: any) => {
          delete item.deleted; // Remove 'deleted' property
          delete item.deleted_by; // Remove 'deleted' property
          delete item.deleted_on; // Remove 'deleted' property
          delete item.deletedBy; // Remove 'deleted' property
          delete item.deletedOn; // Remove 'deleted' property
          return item;
        });
      } else if (instance[relation] && typeof instance[relation] === 'object') {
        delete instance[relation].deleted; // Remove 'deleted' property
        delete instance[relation].deleted_by; // Remove 'deleted' property
        delete instance[relation].deleted_on; // Remove 'deleted' property
        delete instance[relation].deletedBy; // Remove 'deleted' property
        delete instance[relation].deletedOn; // Remove 'deleted' property
      }
    }

    return instance;
  }
}

export interface BaseRelations {
  // describe navigational properties here
}

export type BaseWithRelations = Base & BaseRelations;

/**
 * @deprecated
 * @param instance
 * @returns
 */
function removeDeletedProperty(instance: any): any {
  if (Array.isArray(instance)) {
    return instance.map(item => removeDeletedProperty(item));
  } else if (instance && typeof instance === 'object') {
    const result = {...instance};
    delete result.deleted;
    delete result.deletedOn;

    for (const key in result) {
      result[key] = removeDeletedProperty(result[key]);
    }
    return result;
  }
  return instance;
}
