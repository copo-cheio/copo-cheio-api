import {MixinTarget} from '@loopback/core';
import {Entity,model,property} from '@loopback/repository';

export function TimestampMixin<T extends MixinTarget<Entity>>(Base: T) {
  @model()
  class TimestampedEntity extends Base {
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
      type: 'string',
      required: true,
      jsonSchema: {
        format: 'date-time',
      },
      defaultFn: 'now',
    })
    createdAt: string;

    @property({
      type: 'string',
      required: true,
      jsonSchema: {
        format: 'date-time',
      },
    })
    updatedAt: string;

    constructor(data?: Partial<TimestampedEntity>) {
      super(data);
      const now = new Date().toISOString();
      if (!this.createdAt) {
        this.createdAt = now;
      }
      this.updatedAt = now;
    }
  }
  return TimestampedEntity;
}
