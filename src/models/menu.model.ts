import {model} from '@loopback/repository';
import {Base} from './base.model';

@model()
export class Menu extends Base {

  constructor(data?: Partial<Menu>) {
    super(data);
  }
}

export interface MenuRelations {
  // describe navigational properties here
}

export type MenuWithRelations = Menu & MenuRelations;
