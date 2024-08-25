import {IncludeCover} from './image.include';

export const IncludeBalconysRelations: any = {
  relation: "balconies",
  scope: {
    include: [IncludeCover],
  },
};
