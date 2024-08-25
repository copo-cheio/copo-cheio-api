import {IncludeTagsRelation} from './tag.include';

export const IncludePlaceRelation: any = {
  relation: "place",
  scope: {
    include: [{"relation":"cover"},IncludeTagsRelation],
  },
};
