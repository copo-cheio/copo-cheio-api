import {IncludeEventsRelation} from "./shared/event.include";
import {IncludePlacesRelation} from "./shared/place.include";
import {QueryFilterBaseBlueprint} from "./shared/query-filter.interface";

const IncludeCompanyRelation = { relation: "company" };
const IncludeStaffRelation = {
  relation: "teamStaffs",

  scope: {
    include: [
      {
        relation: "staff",
        scope: {
          include: [
            {
              relation: "user",
              scope: {
                fields: {
                  id: true,
                  name: true,

                  avatar: true,
                  email: true,
                },
              },
            },
          ],
        },
      },
    ],
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
    IncludeStaffRelation,
    IncludeEventsRelation,
    IncludePlacesRelation,
  ],
};
