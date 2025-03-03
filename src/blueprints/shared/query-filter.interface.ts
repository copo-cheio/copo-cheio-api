export interface QueryFilterBase {
  offset?: number;
  limit?: number;
  skip?: number;
  order?: string; //"ASC" | "DESC",
  where?: any;
}

export const QueryFilterBaseBlueprint: QueryFilterBase = {
  offset: 0,
  limit: 100,
  skip: 0,
  where: {
    deleted: false,
  },
  // order: "DESC"
};

export const ExtendQueryFilterWhere = (
  query: any = {},
  extraProperties: any = [],
) => {
  const where = query?.where || {};
  const and = where?.and || [];

  return {...query, where: {...where, and: [...and, ...extraProperties]}};
};
