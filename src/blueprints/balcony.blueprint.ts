import {IncludeCover} from './shared/image.include';
import {IncludeMenuRelation} from './shared/menu.include';
import {IncludeOrders} from './shared/order.include';
import {IncludePlaceRelation} from './shared/place.include';
import {QueryFilterBaseBlueprint} from './shared/query-filter.interface';

export const BalconyFullQuery: any = {
  ...QueryFilterBaseBlueprint,

  fields: {
    id: true,
    name: true,
    placeId: true,
    coverId: true,
    menuId: true,
    description: true,
  },
  include: [
    IncludeCover,
    IncludePlaceRelation,
    IncludeMenuRelation,
    {relation: 'stocks'},
  ],
};

export const BalconySingleQuery: any = {
  ...QueryFilterBaseBlueprint,

  fields: {
    id: true,
    name: true,
    placeId: true,
    coverId: true,
    menuId: true,
    description: true,
  },
  include: [
    IncludeCover,
    IncludePlaceRelation,
    IncludeMenuRelation,
    IncludeOrders,
  ],
};
export const BalconySimpleQuery: any = {
  ...QueryFilterBaseBlueprint,

  fields: {
    id: true,
    name: true,
    placeId: true,
    coverId: true,

    description: true,
  },
  include: [IncludeCover, IncludePlaceRelation],
};
