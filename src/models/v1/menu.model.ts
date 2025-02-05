import {model,property, hasMany} from '@loopback/repository';
import {Base} from './base.model';
import {MenuProduct} from './menu-product.model';

@model()
export class Menu extends Base {

  @property({
    type: 'string'
  })
  name: string;
  @property({
    type: 'string'
  })
  description: string;

  @hasMany(() => MenuProduct)
  products: MenuProduct[];

  constructor(data?: Partial<Menu>) {
    super(data);
  }
}

export interface MenuRelations {
  // describe navigational properties here
}

export type MenuWithRelations = Menu & MenuRelations;
