import {IncludeCountryRelation} from './country.include';

export const IncludeRegionRelation: any = {
  relation: "region",
  scope: {
    include: [IncludeCountryRelation],
  },
};
