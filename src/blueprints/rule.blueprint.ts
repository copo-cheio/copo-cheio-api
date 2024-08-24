import {QueryFilterBaseBlueprint} from './shared/query-filter.interface';

export const RuleQueryFull: any = {
  ...QueryFilterBaseBlueprint,
  fields: {
    id: true,
    name: true,
    code: true,
    value: true,
    translationId:true,
    valueTranslationId:true
  },
  include: [
    {
      relation: "translation",
    },
    {
      relation: "valueTranslation",
    },
  ],
};
