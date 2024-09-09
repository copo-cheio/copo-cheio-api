import {IncludeThumbnail} from './shared/image.include';
import {QueryFilterBaseBlueprint} from "./shared/query-filter.interface";
import {IncludeTagsRelation} from './shared/tag.include';

export const IngredientFullQuery: any = {
  ...QueryFilterBaseBlueprint,

  fields: {
    id: true,
    name: true,
    thumbnailId:true,
    tagIds:true,
    description:true
  },
  include: [IncludeTagsRelation,IncludeThumbnail],
};
