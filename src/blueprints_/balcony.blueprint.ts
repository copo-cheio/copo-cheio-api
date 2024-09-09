import {IncludeCover} from './shared/image.include';
import {IncludePlaceRelation} from "./shared/place.include";
import {QueryFilterBaseBlueprint} from "./shared/query-filter.interface";

export const BalconyFullQuery: any = {
  ...QueryFilterBaseBlueprint,

  fields: {
    id: true,
    name: true,
    placeId:true,
    coverId:true,
  },
  include: [IncludeCover,IncludePlaceRelation],
};
