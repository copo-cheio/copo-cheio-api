import {IncludeCover} from './image.include';

export const IncludeBalconysRelations: any = {
  relation: "balconies",
  scope: {
    include: [IncludeCover],
  },
};

export const IncludeBalconyRelation: any = {
  relation: "balcony",
  scope: {
    include: [IncludeCover],
  },
};
