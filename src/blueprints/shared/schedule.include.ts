export const IncludeScheduleRelation: any = {
  relation: "schedule",
  scope: {
    include: [
      {
        relation: "scheduleRanges",
        scope: {
          include: [{ relation: "start" }, { relation: "end" }],
        },
      },
    ],
  },
};
