import {model,property} from '@loopback/repository';
import {SoftDeleteEntity} from 'loopback4-soft-delete';
@model({
  settings:{
    hiddenProperties: ['deleted',"deleted_on","deleted_by"]
  }
})
export class Base extends   SoftDeleteEntity  {
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
    default: () => new Date()
  })
  created_at ? : Date;

  @property({
    type: 'date',
    generated: true,
    jsonSchema: {
      format: 'date-time',
    },
    // type: 'date',
    default: () => new Date()
    // defaultFn: 'now',
  })
  updated_at ? : Date;



  // isDeleted: boolean
  // @property({
  //   type: 'boolean',
  //   default: false,
  // })
  // isDeleted?: boolean;

  getIdentifier() {
    // console.log('getIdentifier',this.currentUser,'cu')
    return this.id //this?.currentUser?.id;
  }




  constructor(
    data?: Partial<Base>,
    // @inject(AuthenticationBindings.CURRENT_USER, { optional: true })
    // public currentUser?: any // Inject the current user profile
  ) {
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
