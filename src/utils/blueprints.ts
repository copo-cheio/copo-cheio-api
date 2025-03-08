export const extendScope = (base: any = {}, scope: any = {}) => {
  /*   export const IncludePlaceEventInstancesRelation: any = {
    relation: 'eventInstances',
    scope: {
      include: [
        IncludeEventsMinimalRelation
      ],
      where: {
        and: [{deleted: false}],
      },
      order: ['startDate ASC'],
      limit: 10,
    },
  };
   */
  const currentIncludes = Array.isArray(scope.include) ? scope.include : null;
  const currentWhereAnd = Array.isArray(scope?.where?.and)
    ? scope.where.and
    : null;
  const currentWhere = typeof scope?.where == 'object' ? scope.where : {};
  const originalScope: any = base.scope || {};
  const extended: any = {
    ...base,
    scope: {
      ...originalScope,
    },
  };
  if (currentIncludes)
    extended.scope.includes = [
      ...(extended.scope.includes || []),
      ...currentIncludes,
    ];
  if (currentWhereAnd) {
    extended.scope.where = extended.scope.where || {}; //[...(extended.scope.includes || []), ...currentIncludes];
    extended.scope.where.and = [
      ...(extended.scope.where.and || []),
      ...currentWhereAnd,
    ];
  } else if (currentWhere) {
    extended.scope.where = {...(extended.scope.where || {}), ...currentWhere};
  }

  return extended;
};
