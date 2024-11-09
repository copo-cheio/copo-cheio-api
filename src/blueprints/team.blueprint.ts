import {IncludeEventsRelation} from "./shared/event.include";
import {IncludePlacesRelation} from "./shared/place.include";
import {QueryFilterBaseBlueprint} from "./shared/query-filter.interface";
import {IncludeStaffRelation} from "./shared/staff.include";

const IncludeCompanyRelation = { relation: "company" };
const IncludeTeamStaffRelation = {
  relation: "teamStaffs",

  scope: {
    where:{deleted:false},
    include: [IncludeStaffRelation],

  },
};

export const TeamQueryFull: any = {
  ...QueryFilterBaseBlueprint,

  fields: {
    id: true,
    created_at: true,
    updated_at: true,
    name: true,
    companyId: true,
  },
  include: [
    // IncludeCompanyRelation,
    IncludeTeamStaffRelation,
    IncludeEventsRelation,
    IncludePlacesRelation,
  ],
};
