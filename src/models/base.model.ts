import {Entity,model,property} from '@loopback/repository';
import {v4 as uuid} from 'uuid';
@model()
export class Base extends Entity {
  @property({
    type: 'string',
    id: true,
    default: () => uuid()
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
    console.log(this,'BASE')
  }
}

export interface BaseRelations {
  // describe navigational properties here
}

export type BaseWithRelations = Base & BaseRelations;
