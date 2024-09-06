import {IncludeThumbnail} from './image.include';
import {IncludeTagsRelation} from './tag.include';

export const IncludeIngredientRelation: any = {
  relation: "ingredient",
  scope: {
    include: [IncludeThumbnail, IncludeTagsRelation]
  },
};
