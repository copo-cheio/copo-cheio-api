import {IncludeAddressRelation} from "./shared/address.include";
import {IncludeLineupRelation} from "./shared/lineup.include";
import {IncludePlaceRelation} from "./shared/place.include";
import {IncludePlaylistRelation} from "./shared/playlist.include";
import {QueryFilterBaseBlueprint} from "./shared/query-filter.interface";
import {IncludeRulesRelation} from "./shared/rule.include";
import {IncludeScheduleRelation} from "./shared/schedule.include";
import {IncludeTicketsRelation} from "./shared/ticket.include";

export const EventsQuery: any = {
  ...QueryFilterBaseBlueprint,
  fields: {
    id: true,
    name: true,
    description: true,
    email: true,
    webpage: true,
    status: true,
    coverId: true,
    addressId: true,
    scheduleId: true,
    playlistId: true,
    placeId: true,
  },
  include: [
    "cover",
    IncludeAddressRelation,
    IncludeScheduleRelation,
    IncludePlaceRelation,
  ],
};

export const EventFullQuery: any = {
  fields: {
    id: true,
    name: true,
    description: true,
    email: true,
    webpage: true,
    status: true,
    coverId: true,
    addressId: true,
    scheduleId: true,
    playlistId: true,
    placeId: true,
  },
  include: [
    "cover",
    IncludeAddressRelation,
    IncludeScheduleRelation,
    IncludePlaceRelation,
    IncludePlaylistRelation,
    IncludeRulesRelation,
    IncludeTicketsRelation,
    IncludeLineupRelation,
  ],
};
