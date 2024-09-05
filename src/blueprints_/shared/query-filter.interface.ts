export interface QueryFilterBase {
  "offset"?: number;
  "limit"?: number;
  "skip"?: number,
  "order"?: "ASC" | "DESC"
}

export const QueryFilterBaseBlueprint:QueryFilterBase = {
  offset:0,
  limit:100,
  skip:0,
  // order: "DESC"
}
