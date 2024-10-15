import {Entity,model,property} from '@loopback/repository';
@model()
export class Base extends   Entity  {
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
    defaultFn: 'now',
  })
  created_at ? : Date;

  @property({
    type: 'date',
    generated: true,
    jsonSchema: {
      format: 'date-time',
    },
    defaultFn: 'now',
  })
  updated_at ? : Date;



  // isDeleted: boolean

  @property({
    type: 'boolean',
    default: false,
  })
  isDeleted?: boolean;


  constructor(data?: Partial<Base>) {
    super(data);

  }
}

export interface BaseRelations {
  // describe navigational properties here
}

export type BaseWithRelations = Base & BaseRelations;


// import {Entity, model, property} from '@loopback/repository';
// import {TimestampMixin} from '../mixins/timestamp.mixin';

// @model()
// export class Product extends TimestampMixin(Entity) {
//   @property({
//     type: 'number',
//     id: true,
//     generated: true,
//   })
//   id?: number;

//   @property({
//     type: 'string',
//     required: true,
//   })
//   name: string;

//   // Other properties...

//   constructor(data?: Partial<Product>) {
//     super(data);
//   }
// }
