import {IncludeThumbnail} from './image.include';
import {IncludeIngredientRelation} from './ingredient.include';
import {IncludePriceRelation} from './price.include';
import {IncludeTagsRelation} from './tag.include';

export const IncludeProductRelation: any = {
  relation: 'product',
  scope: {
    include: [
      {
        relation: 'ingredients',
        scope: {where: {deleted: false}, include: [IncludeIngredientRelation]},
      },
      {
        relation: 'options',
        scope: {
          where: {deleted: false},
          include: [IncludeIngredientRelation, IncludePriceRelation],
        },
      },
      IncludeThumbnail,
      IncludeTagsRelation,
    ],
  },
};
