export const IncludeTeamsRelation: any = {
  relation: "teams",
  scope: {
     include: [{
      relation: "staff",
      scope:{
        include:[{relation:"user"}]
      }
     }],
   },
};
