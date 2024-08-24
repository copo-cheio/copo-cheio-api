import {IncludeAddressRelation} from "./shared/address.include";
import {IncludeBalconysRelations} from "./shared/balcony.include";
import {IncludeEventsRelation} from "./shared/event.include";
import {IncludePlaylistRelation} from "./shared/playlist.include";
import {QueryFilterBaseBlueprint} from "./shared/query-filter.interface";
import {IncludeRulesRelation} from "./shared/rule.include";
import {IncludeScheduleRelation} from "./shared/schedule.include";
import {IncludeTagsRelation} from "./shared/tag.include";

export const PlaceQueryFull: any = {
  ...QueryFilterBaseBlueprint,

  fields: {
    id: true,
    created_at: true,
    updated_at: true,
    name: true,
    description: true,
    coverId: true,
    addressId: true,
    playlistId: true,
    scheduleId:true,
  },

  include: [
    "cover",
    IncludeBalconysRelations,
    IncludeAddressRelation,
    IncludeTagsRelation,
    IncludeScheduleRelation,
    IncludePlaylistRelation,
    IncludeEventsRelation,
    IncludeRulesRelation,
  ],
};

export const PlacesQuery: any = {
  ...QueryFilterBaseBlueprint,

  fields: {
    id: true,
    created_at: true,
    updated_at: true,
    name: true,
    description: true,
    coverId: true,
    addressId: true,
    scheduleId:true,
  },

  include: [
    "cover",
    IncludeAddressRelation,
    IncludeTagsRelation,
    IncludeScheduleRelation,
  ],
};



/*
{"offset":0,"limit":100,"skip":0,"order":"DESC","fields":{"id":true,"created_at":true,"updated_at":true,"name":true,"description":true,"coverId":true,"addressId":true,"playlistId":true},"include":["cover",{"relation":"balconies","scope":{"include":[{"relation":"cover"}]}},{"relation":"address","scope":{"include":[{"relation":"region"},{"relation":"country"}]}},{"relation":"tags","scope":{"include":[{"relation":"translation"}]}},{"relation":"playlist","scope":{"include":[{"relation":"songs","scope":{"include":[{"relation":"artist"}]}}]}},{"relation":"events","scope":{"include":[{"relation":"tags","scope":{"include":[{"relation":"translation"}]}},{"relation":"cover"}]}}]}*/
