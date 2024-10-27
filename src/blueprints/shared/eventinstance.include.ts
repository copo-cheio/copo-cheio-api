


export const IncludeEventInstanceRelation: any = {
 "relation":"instances",
  "scope":{
    "where":{
      "startDate":{
        "gte": new Date().toISOString()
      },
      "deleted":false
    },
    "limit":1
  }
};
