import {IncludeThumbnail} from './shared/image.include';
import {IncludeIngredientRelation} from './shared/ingredient.include';
import {IncludePriceRelation} from './shared/price.include';
import {QueryFilterBaseBlueprint} from './shared/query-filter.interface';
import {IncludeTagsRelation} from './shared/tag.include';

export const ProductQueryFull: any = {
  ...QueryFilterBaseBlueprint,

  fields: {
    id: true,
    live: true,
    created_at: true,
    updated_at: true,
    name: true,
    description: true,
    thumbnailId: true,
    tagIds: true,
  },

  include: [
    {
      relation: 'ingredients',
      scope: {include: [IncludeIngredientRelation]},
    },
    {
      relation: 'options',
      scope: {include: [IncludeIngredientRelation, IncludePriceRelation]},
    },
    IncludeThumbnail,
    IncludeTagsRelation,
  ],
};
