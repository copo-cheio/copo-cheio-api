import {IncludeThumbnail} from "./image.include";
import {IncludeIngredientRelation} from "./ingredient.include";
import {IncludeTagsRelation} from './tag.include';

export const IncludeProductRelation: any = {
  relation: "product",
  scope: {
    include: [
      {
        relation: "ingredients",
        scope: { include: [IncludeIngredientRelation] },
      },
      IncludeThumbnail,
      IncludeTagsRelation
    ],
  },
};
