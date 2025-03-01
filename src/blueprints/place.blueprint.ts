import {IncludeAddressRelation} from './shared/address.include';
import {IncludeBalconysRelations} from './shared/balcony.include';
import {IncludeContactsRelation} from './shared/contacts.include';
import {IncludeEventsRelation} from './shared/event.include';
import {IncludeCover, IncludeGallery} from './shared/image.include';
import {IncludeOpeningHoursRelation} from './shared/openinghours.include';
import {IncludePlaylistRelation} from './shared/playlist.include';
import {QueryFilterBaseBlueprint} from './shared/query-filter.interface';
import {IncludeRulesRelation} from './shared/rule.include';
import {IncludeTagsRelation} from './shared/tag.include';
import {IncludeTeamRelation} from './shared/team.include';

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
    scheduleId: true,
    tagIds: true,
    email: true,
    phone: true,
    webpage: true,
  },

  include: [
    IncludeCover,
    IncludeBalconysRelations,
    IncludeAddressRelation,
    IncludeTagsRelation,
    // IncludeScheduleRelation,
    IncludePlaylistRelation,
    IncludeEventsRelation,
    IncludeRulesRelation,
    IncludeOpeningHoursRelation,
    IncludeGallery,
    IncludeContactsRelation,
  ],
};

export const BasePlacesQuery: any = {
  ...QueryFilterBaseBlueprint,

  fields: {
    id: true,
    created_at: true,
    updated_at: true,
    name: true,
    description: true,
    coverId: true,
    addressId: true,
    scheduleId: true,
    tagIds: true,
    email: true,
    phone: true,
    webpage: true,
    teamId: true,
  },

  include: [
    {relation: 'cover'},
    IncludeAddressRelation,
    IncludeTagsRelation,
    // IncludeScheduleRelation,
    // IncludeOpeningHoursRelation,
  ],
};

export const PlacesQuery: any = {
  ...BasePlacesQuery,

  include: [
    ...BasePlacesQuery.include,
    // IncludeScheduleRelation,
    IncludeOpeningHoursRelation,
  ],
};

const DefaultPlace: any = {
  place: '00000000-0000-0000-0000-000000000021',
};

export const PlaceManagerQueryFull: any = {
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
    scheduleId: true,
    tagIds: true,
    email: true,
    phone: true,
    webpage: true,
    teamId: true,
  },

  include: [
    IncludeCover,
    IncludeBalconysRelations,
    IncludeAddressRelation,
    IncludeTagsRelation,
    // IncludeScheduleRelation,
    IncludePlaylistRelation,
    IncludeEventsRelation,
    IncludeRulesRelation,
    IncludeOpeningHoursRelation,
    IncludeGallery,
    IncludeContactsRelation,
    IncludeTeamRelation,
  ],
};

export const PlaceBelongsToTransformer = (
  record: any,
  type: string = 'place',
) => {
  const key = 'placeId';
  const value = record?.[key];
  const valid = typeof value == 'string' && value.indexOf('-') > -1;
  if (!valid) {
    record[key] = DefaultPlace[type];
  }
  return record;
};

/*
{"offset":0,"limit":100,"skip":0,"order":"DESC","fields":{"id":true,"created_at":true,"updated_at":true,"name":true,"description":true,"coverId":true,"addressId":true,"playlistId":true},"include":["cover",{"relation":"balconies","scope":{"include":[{"relation":"cover"}]}},{"relation":"address","scope":{"include":[{"relation":"region"},{"relation":"country"}]}},{"relation":"tags","scope":{"include":[{"relation":"translation"}]}},{"relation":"playlist","scope":{"include":[{"relation":"songs","scope":{"include":[{"relation":"artist"}]}}]}},{"relation":"events","scope":{"include":[{"relation":"tags","scope":{"include":[{"relation":"translation"}]}},{"relation":"cover"}]}}]}*/
