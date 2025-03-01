export const IncludeTeamsRelation: any = {
  relation: 'teams',
  scope: {
    include: [
      {
        relation: 'staff',
        scope: {
          include: [{relation: 'user'}],
        },
      },
    ],
  },
};
export const IncludeTeamRelation: any = {
  relation: 'team',
  scope: {
    include: [
      {
        relation: 'staff',
        scope: {
          include: [{relation: 'user'}],
        },
      },
    ],
  },
};
