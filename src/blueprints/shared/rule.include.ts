export const IncludeRulesRelation: any = {
  relation: "rules",
  scope: {
    include: [
      {
        relation: "translation",
      },
      {
        relation: "valueTranslation",
      },
    ],
  },
};
