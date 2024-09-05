import {IncludeThumbnail} from "./image.include";

export const IncludeProductRelation: any = {
  relation: "product",
  scope: {
    include: [
      { relation: "ingredients", scope: { include: [IncludeThumbnail] } },
      IncludeThumbnail,
    ],
  },
};
