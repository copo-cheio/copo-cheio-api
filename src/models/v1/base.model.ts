import {model, property} from '@loopback/repository';
import {SoftDeleteEntity} from 'loopback4-soft-delete';

const BASE_MODEL_CONFIG = {
  settings: {
    hiddenProperties: ['deleted', 'deletedBy', 'deletedOn', 'isDeleted'],
  },
};
@model({
  settings: {
    hiddenProperties: ['deleted', 'deletedBy', 'deletedOn', 'isDeleted'],
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
    const instance = super.toJSON(); // Get default JSON

    // Ensure `hiddenProperties` exist and is an array
    const modelClass = this.constructor as typeof Base;
    const hiddenProps =
      (modelClass.definition?.settings?.hiddenProperties as string[]) ||
      BASE_MODEL_CONFIG.settings.hiddenProperties;

    // Remove hidden properties from the current model
    hiddenProps.forEach(prop => delete instance[prop]);

    // Recursively remove hidden properties from related objects
    Object.keys(instance).forEach(key => {
      if (Array.isArray(instance[key])) {
        instance[key] = instance[key].map(item =>
          item && typeof item === 'object' ? this.sanitizeObject(item) : item,
        );
      } else if (instance[key] && typeof instance[key] === 'object') {
        instance[key] = this.sanitizeObject(instance[key]);
      }
    });

    return instance;
  }

  private sanitizeObject(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;

    const modelClass = obj.constructor as typeof Base;
    const hiddenProps =
      (modelClass.definition?.settings?.hiddenProperties as string[]) ||
      BASE_MODEL_CONFIG.settings.hiddenProperties;

    hiddenProps.forEach(prop => delete obj[prop]);

    Object.keys(obj).forEach(key => {
      if (Array.isArray(obj[key])) {
        obj[key] = obj[key].map(item =>
          item && typeof item === 'object' ? this.sanitizeObject(item) : item,
        );
      } else if (obj[key] && typeof obj[key] === 'object') {
        obj[key] = this.sanitizeObject(obj[key]);
      }
    });

    return obj;
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

export function mergeBaseModelConfiguration(newModelConfiguration: any = {}) {
  if (Array.isArray(newModelConfiguration?.settings?.hiddenProperties)) {
    newModelConfiguration.settings.hiddenProperties = [
      ...BASE_MODEL_CONFIG.settings.hiddenProperties,
      ...newModelConfiguration.settings.hiddenProperties,
    ];
  }
  return newModelConfiguration;
}
