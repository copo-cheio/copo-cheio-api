import {QueryFilterBaseBlueprint} from './shared/query-filter.interface';
import {IncludeUserRelation} from './shared/user.include';

export const StaffQueryFull: any = {
  ...QueryFilterBaseBlueprint,

  fields: {
    id: true,
    created_at: true,
    updated_at: true,
    userId: true,
    role: true,
  },
  include: [IncludeUserRelation],
};
