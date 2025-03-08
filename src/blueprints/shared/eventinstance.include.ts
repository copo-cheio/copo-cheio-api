import {extendScope} from '../../utils/blueprints';
import {IncludeEventMinimalRelation} from './event.include';
import {IncludePlaceRelation} from './place.include';

export const IncludeEventInstanceRelation: any = {
  relation: 'instances',
  scope: {
    where: {
      endDate: {
        gt: new Date(),
      },
    },
    order: ['startDate ASC'],
    limit: 1,
  },
};

export const IncludeEventInstancesRelation: any = {
  relation: 'instances',
  scope: {
    where: {
      and: [
        {
          endDate: {
            gt: new Date(),
          },
        },
        {deleted: false},
      ],
    },
    order: ['startDate ASC'],
    limit: 10,
  },
};
export const IncludePlaceInstancesRelation: any = {
  relation: 'instances',
  scope: {
    include: [IncludePlaceRelation],
    where: {
      and: [{deleted: false}],
    },
    order: ['startDate ASC'],
    limit: 100,
  },
};
export const IncludePlaceEventInstancesRelation: any = {
  relation: 'eventInstances',
  scope: {
    include: [IncludeEventMinimalRelation],
    where: {
      and: [{deleted: false}],
    },
    order: ['startDate ASC'],
    limit: 100,
  },
};

export const IncludeNextPlaceEventInstancesRelation: any = {
  ...extendScope(IncludePlaceEventInstancesRelation, {
    where: {and: [{startDate: {gte: new Date()}}]},
  }),
};
export const IncludeNextPlaceInstancesRelation: any = {
  ...extendScope(IncludePlaceInstancesRelation, {
    where: {and: [{startDate: {gte: new Date()}}]},
  }),
};
