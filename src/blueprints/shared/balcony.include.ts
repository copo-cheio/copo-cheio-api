export const IncludeBalconysRelations: any = {
  relation: "balconies",
  scope: {
    include: [{"relation":"cover"}],
  },
};
