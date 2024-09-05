import {IncludeCover} from './image.include';
import {IncludeScheduleRelation} from './schedule.include';

export const IncludeLineupRelation: any = {
  relation: "lineups",
  scope: {
    include: [
      {
        relation: "lineUpArtists",
        scope: {
          include: [
            {
              relation: "artist",
              scope: {
                include: [IncludeCover],
              },
            },
            IncludeScheduleRelation
          ],
        },
      },
    ],
  },
};
