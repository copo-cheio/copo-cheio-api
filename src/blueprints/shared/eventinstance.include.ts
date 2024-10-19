


export const IncludeEventInstanceRelation: any = {
 "relation":"instances",
  "scope":{
    "where":{
      "startDate":{
        "gte": new Date().toISOString()
      }
    },
    "limit":1
  }
};
