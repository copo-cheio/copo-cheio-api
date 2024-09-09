import {belongsTo,model,property} from '@loopback/repository';
import {Base} from './base.model';
import {Image} from './image.model';
import {Place} from './place.model';
import {Menu} from './menu.model';

@model()
export class Balcony extends Base {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @belongsTo(() => Place)
  placeId: string;

  @belongsTo(() => Image)
  coverId: string;

  @belongsTo(() => Menu)
  menuId: string;

  constructor(data?: Partial<Balcony>) {
    super(data);
  }
}

export interface BalconyRelations {
  // describe navigational properties here
}

export type BalconyWithRelations = Balcony & BalconyRelations;
