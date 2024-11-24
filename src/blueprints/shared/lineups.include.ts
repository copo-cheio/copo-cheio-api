export const IncludeTimetablesRelation: any = {
  relation: "timeTables",
  scope: {
    include: [{ relation: "playlist" }],
  },
};
export const IncludeLineupsRelation: any = {
  relation: "lineups",
  scope: {
    include: [IncludeTimetablesRelation],
  },
};
