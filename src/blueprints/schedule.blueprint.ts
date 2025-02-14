import {belongsToTransformer} from '../shared/database';

export const DefaultSchedule = {
  once: '00000000-0000-0000-0000-000000000011',
  repeat: '00000000-0000-0000-0000-000000000012',
  lineup: '00000000-0000-0000-0000-00000000013',
};

export const ScheduleBelongsToTransformer = (
  record: any,
  type: 'once' | 'repeat' | 'lineup' = 'once',
) => {
  record = belongsToTransformer(record, type, 'scheduleId', DefaultSchedule);
  delete record.schedule;
  return record;
};
