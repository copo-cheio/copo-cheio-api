export const IncludeUserRelation = {
  relation: "user",
  scope: {
    fields: {
      id: true,
      name: true,

      avatar: true,
      email: true,
    },
  },
};
