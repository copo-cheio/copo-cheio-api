import {IncludeCover} from './shared/image.include';
import {IncludeMenuRelation} from './shared/menu.include';
import {IncludeOrders} from './shared/order.include';
import {IncludePlaceRelation} from "./shared/place.include";
import {QueryFilterBaseBlueprint} from "./shared/query-filter.interface";

export const BalconyFullQuery: any = {
  ...QueryFilterBaseBlueprint,

  fields: {
    id: true,
    name: true,
    placeId:true,
    coverId:true,
    menuId:true,
    description:true
  },
  include: [IncludeCover,IncludePlaceRelation, IncludeMenuRelation],
};

export const BalconySingleQuery: any = {
  ...QueryFilterBaseBlueprint,

  fields: {
    id: true,
    name: true,
    placeId:true,
    coverId:true,
    menuId:true,
    description:true
  },
  include: [IncludeCover,IncludePlaceRelation, IncludeMenuRelation, IncludeOrders],
};


// {"include":[{"relation":"orderItems","scope"}]}
