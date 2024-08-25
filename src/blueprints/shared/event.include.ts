import {IncludeCover} from './image.include';
import {IncludeTagsRelation} from './tag.include';

export const IncludeEventsRelation: any = {
  relation: "events",
  scope: {
    include: [IncludeTagsRelation, IncludeCover],
  },
};
