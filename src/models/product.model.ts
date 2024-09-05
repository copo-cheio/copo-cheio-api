import {model,property, referencesMany} from '@loopback/repository';
import {Base} from './base.model';
import {Tag} from './tag.model';

@model()
export class Product extends Base {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  name?: string;

  @referencesMany(() => Tag)
  tagIds: string[];

  constructor(data?: Partial<Product>) {
    super(data);
  }
}

export interface ProductRelations {
  // describe navigational properties here
}

export type ProductWithRelations = Product & ProductRelations;
