import {belongsTo,model} from '@loopback/repository';
import {Base} from './base.model';
import {Image} from './image.model';
import {Menu} from './menu.model';
import {Price} from './price.model';
import {Product} from './product.model';

@model()
export class MenuProduct extends Base {


  // @property({
  //   type: 'string',
  @belongsTo(() => Menu)
  menuId: string;

  @belongsTo(() => Image)
  thumbnailId: string = "64829554-6ad4-4f27-b192-1680eea924fb";
  // @belongsTo(() => Image)
  // thumbnailId: string;
  // })
  // menuId?: string;

  @belongsTo(() => Price)
  priceId: string;

  @belongsTo(() => Product)
  productId: string;

  constructor(data?: Partial<MenuProduct>) {
    super(data);
  }
}

export interface MenuProductRelations {
  // describe navigational properties here
}

export type MenuProductWithRelations = MenuProduct & MenuProductRelations;
