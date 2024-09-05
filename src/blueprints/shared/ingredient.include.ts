import {IncludeThumbnail} from './image.include';

export const IncludeIngredientRelation: any = {
  relation: "ingredient",
  scope: {
    include: [IncludeThumbnail]
  },
};
