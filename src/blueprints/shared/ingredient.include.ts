import {IncludeThumbnail} from './image.include';
import {IncludeTagsRelation} from './tag.include';

export const IncludeIngredientRelation: any = {
  relation: 'ingredient',
  scope: {
    where: {
      deleted: false,
    },
    include: [IncludeThumbnail, IncludeTagsRelation],
  },
};
