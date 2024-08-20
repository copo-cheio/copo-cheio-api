import {model, property} from '@loopback/repository';
import {BaseModel} from '.';

@model()
export class Balcony extends BaseModel {
  @property({
    type: 'string',
    required: true,
  })
  name: string;


  constructor(data?: Partial<Balcony>) {
    super(data);
  }
}

export interface BalconyRelations {
  // describe navigational properties here
}

export type BalconyWithRelations = Balcony & BalconyRelations;
