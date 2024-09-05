import {IncludeTranslation} from './shared/translation.include';

export const TagQueryFull: any = {
  // ...QueryFilterBaseBlueprint,
  fields: {
    id: true,
    name: true,
    type: true,
    translationId: true,
  },
  include: [
  IncludeTranslation
  ],
};
