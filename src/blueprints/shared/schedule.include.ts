export const ScheduleTypes:any = [
  "once",
  "repeat",
  "lineup"
]
export const IncludeScheduleRangeRelation:any = {

    relation: "scheduleRanges",
    scope: {
      include: [{ relation: "start" }, { relation: "end" }],

  },
}
export const IncludeScheduleRelation: any = {
  relation: "schedule",
  scope: {
    include: [
      IncludeScheduleRangeRelation
    ],
  },
};

