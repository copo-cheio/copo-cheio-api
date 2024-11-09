import {IncludeUserRelation} from './user.include';

export const IncludeStaffRelation = {
  relation: "staff",
  scope: {
    include: [
      IncludeUserRelation
    ],
  },
};
