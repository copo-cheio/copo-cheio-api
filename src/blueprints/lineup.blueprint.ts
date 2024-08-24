import {QueryFilterBaseBlueprint} from './shared/query-filter.interface';
import {IncludeScheduleRelation} from './shared/schedule.include';

export const LineupFullQuery:any = {

  ...QueryFilterBaseBlueprint,
    "fields": {
      "id": true,
      "created_at": true,
      "updated_at": true,
      "name": true,
      "eventId": true
    },
    "include": [
      {
        "relation": "lineUpArtists",
        scope: {
          include:[
            {relation: "artist"},
            IncludeScheduleRelation
          ]
        }
       }
    ]

}
