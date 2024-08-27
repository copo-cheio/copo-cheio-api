import {Entity,model,property} from '@loopback/repository';
@model()
export class Base extends Entity {
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
    postgresql: {
      dataType: 'date', //<---- only this line is different
    },
    defaultFn: 'now', //<---- only this line is different
  })
  created_at ? : Date;

  @property({
    type: 'date',
    generated: true,
    postgresql: {
      dataType: 'date',
    },
    defaultFn: 'now', //<---- only this line is different
  })
  updated_at ? : Date;



  constructor(data?: Partial<Base>) {
    super(data);

  }
}

export interface BaseRelations {
  // describe navigational properties here
}

export type BaseWithRelations = Base & BaseRelations;
