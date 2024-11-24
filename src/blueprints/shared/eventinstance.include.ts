export const IncludeEventInstanceRelation: any = {
  relation: "instances",
  scope: {
    where: {

          endDate: {
            gt: new Date()
          }

    },
    order: ["startDate ASC"],
    limit: 1
  }
};
