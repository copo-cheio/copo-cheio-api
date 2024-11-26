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
export const IncludeEventInstancesRelation: any = {
  relation: "instances",
  scope: {
    where: {

          endDate: {
            gt: new Date()
          }

    },
    order: ["startDate ASC"],
    limit: 10
  }
};
