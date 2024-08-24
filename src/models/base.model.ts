import {Entity,model,property} from '@loopback/repository';
@model()
export class Base extends Entity {
  @property({
    type: 'string',
    id: true,
    // defaultFn: 'uuid'
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
    default: () => new Date()
  })
  created_at ? : string;

  @property({
    type: 'date',
    default: () => new Date()
  })
  updated_at ? : string;



  constructor(data?: Partial<Base>) {
    super(data);
    // console.log(this,'BASE')
  }
}

export interface BaseRelations {
  // describe navigational properties here
}

export type BaseWithRelations = Base & BaseRelations;
