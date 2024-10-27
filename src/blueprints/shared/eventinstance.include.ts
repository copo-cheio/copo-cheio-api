export const IncludeEventInstanceRelation: any = {
  relation: "instances",
  scope: {
    where: {
      and: [
        {
          endDate: {
            gte: new Date().toISOString(),
          },
        },
        { deleted: false },
      ],
    },
    order: ["startDate ASC"],
    limit: 1,
  },
};
