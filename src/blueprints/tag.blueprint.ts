import {QueryFilterBaseBlueprint} from './shared/query-filter.interface';

export const TagQueryFull: any = {
  ...QueryFilterBaseBlueprint,
  fields: {
    id: true,

    name: true,
    type: true,
    translationId:true,
  },
  include: [
    {
      relation: "translation",
    },
  ],
};
