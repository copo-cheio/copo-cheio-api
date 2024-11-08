import {IncludeContactsRelation} from "./shared/contacts.include";
import {IncludeEventsRelation} from "./shared/event.include";
import {IncludeCover} from "./shared/image.include";
import {QueryFilterBaseBlueprint} from "./shared/query-filter.interface";
import {IncludeTeamsRelation} from "./shared/team.include";

const IncludeEventsWithPlacesRelation = JSON.parse(JSON.stringify(IncludeEventsRelation))
IncludeEventsWithPlacesRelation.scope.include.push({relation:"place"})
// const StaffMembersRelation = {
//   relation: "staffMembers",
//   scope: {
//     include: [{ relation: "user" }],
//   },
// };

export const CompanyQueryFull: any = {
  ...QueryFilterBaseBlueprint,

  fields: {
    id: true,
    created_at: true,
    updated_at: true,
    name: true,
    description: true,
    coverId: true,
    // previousPlaceIds: true,
  },

  include: [
    IncludeCover,
    IncludeContactsRelation,
    // StaffMembersRelation,
    IncludeTeamsRelation,
    // IncludePreviousPlacesRelation,
    IncludeEventsWithPlacesRelation,

  ],
};

export const CompanysQuery: any = {
  ...QueryFilterBaseBlueprint,

  fields: {
    id: true,
    created_at: true,
    updated_at: true,
    name: true,
    description: true,
    coverId: true,
  },

  include: [
    IncludeCover,

    IncludeContactsRelation,

  ],
};
