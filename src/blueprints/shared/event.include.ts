import {IncludeCover} from './image.include';
import {IncludeScheduleRelation} from './schedule.include';
import {IncludeTagsRelation} from './tag.include';

export const IncludeEventsRelation: any = {
  relation: "events",
  scope: {
    include: [IncludeTagsRelation, IncludeCover, IncludeScheduleRelation],
  },
};
