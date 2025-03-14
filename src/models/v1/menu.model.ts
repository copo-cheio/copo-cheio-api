import {belongsTo, hasMany, model, property} from '@loopback/repository';

import {Balcony} from './balcony.model';
import {Base} from './base.model';
import {Company} from './company.model';
import {MenuProduct} from './menu-product.model';

@model()
export class Menu extends Base {
  @property({
    type: 'string',
  })
  name: string;
  @property({
    type: 'string',
  })
  description: string;

  @hasMany(() => MenuProduct)
  products: MenuProduct[];

  @hasMany(() => Balcony, {keyTo: 'menuId'})
  balconies: Balcony[];

  @belongsTo(() => Company)
  companyId: string;

  constructor(data?: Partial<Menu>) {
    super(data);
  }
}

export interface MenuRelations {
  // describe navigational properties here
}

export type MenuWithRelations = Menu & MenuRelations;
