import {IncludeContactsRelation} from "./shared/contacts.include";
import {IncludeCover} from "./shared/image.include";
import {QueryFilterBaseBlueprint} from "./shared/query-filter.interface";
const StaffMembersRelation =
  {
    relation: "staffMembers",
    scope: {
      include:[{relation: "user"}]
    },
  }

export const CompanyQueryFull: any = {
  ...QueryFilterBaseBlueprint,

  fields: {
    id: true,
    created_at: true,
    updated_at: true,
    name: true,
    description: true,
    coverId: true,

  },

  include: [IncludeCover, IncludeContactsRelation,StaffMembersRelation
    // ,
    // StaffMemberRelation
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

    // IncludeScheduleRelation,
    // IncludeOpeningHoursRelation,
  ],
};
