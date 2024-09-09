
import {IncludeCover} from './image.include';
import {IncludeScheduleRelation} from './schedule.include';
import {IncludeTagsRelation} from './tag.include';



export const EventTypes:any =  ["concert","festival","rave","open air"]

export const IncludeEventsRelation: any = {
  relation: "events",
  scope: {
    include: [IncludeTagsRelation, IncludeCover, IncludeScheduleRelation],
  },
};
