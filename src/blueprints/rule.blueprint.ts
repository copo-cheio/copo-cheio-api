import {QueryFilterBaseBlueprint} from './shared/query-filter.interface';
import {IncludeTranslation} from './shared/translation.include';

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
    IncludeTranslation,
    {
      relation: "valueTranslation",
    },
  ],
};
