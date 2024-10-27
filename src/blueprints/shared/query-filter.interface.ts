export interface QueryFilterBase {
  "offset"?: number;
  "limit"?: number;
  "skip"?: number,
  "order"?: string, //"ASC" | "DESC",
  "where"?:any
}

export const QueryFilterBaseBlueprint:QueryFilterBase = {
  offset:0,
  limit:100,
  skip:0,
  where: {
    deleted: false
  }
  // order: "DESC"
}
