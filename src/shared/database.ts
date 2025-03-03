import {IsolationLevel} from '@loopback/repository';

export const sortByDistance = ($user_lat: any, $user_lng: any) => {
  return `SELECT
    id, (
      6371 * acos (
      cos ( radians($user_lat) )
      * cos( radians( latitude ) )
      * cos( radians( longitude ) - radians($user_lng) )
      + sin ( radians($user_lat) )
      * sin( radians( latitude ) )
    )
) AS distance
FROM address
HAVING distance < 30
ORDER BY distance
`;
};

export const belongsToTransformer = (
  record: any,
  type: any,
  key: string,
  defaults: any = {},
) => {
  const value = record?.[key];
  const valid = typeof value == 'string' && value.indexOf('-') > -1;
  if (!valid) {
    record[key] = defaults[type];
  }
  return record;
};

export const validateLiveRecord = (
  record: any,
  requiredFields: string[] = [],
  nonDefaultRelations: string[] = [],
) => {
  const validate = () => {
    let isValid = true;
    const notNull = new Set([...requiredFields, ...nonDefaultRelations]);

    for (const nN of notNull) {
      if (record[nN] == null) {
        isValid = false;
        return false;
      }
    }
    for (const nonDefault of nonDefaultRelations) {
      if (record[nonDefault] && record[nonDefault].indexOf('00000000') > 0) {
        isValid = false;
        return false;
      }
    }

    return isValid;
  };

  const live = validate();
  record.live = live;
  return record;
};

export const transactionWrapper = async (
  repository: any,
  operation: (transaction: any) => Promise<any>,
) => {
  const transaction = await repository.dataSource.beginTransaction({
    isolationLevel: IsolationLevel.READ_COMMITTED,
  });
  try {
    const result = await operation(transaction);

    await transaction.commit();
    return result;
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
};

export const updateManyRelationByIds = async (
  currentIds: any[],
  newIds: string[],
  callbackFn: any,
) => {
  const toAdd = [];
  const toRemove = [];
  currentIds = currentIds.map((c: any) => {
    let id = c;
    if (typeof id !== 'string') {
      id = c.id;
    }
    return id;
  });
  newIds = newIds.map((c: any) => {
    let id = c;
    if (typeof id !== 'string') {
      id = c.id;
    }
    return id;
  });

  for (const id of currentIds) {
    if (!newIds.includes(id)) {
      toRemove.push(id);
    }
  }
  for (const id of newIds) {
    if (!currentIds.includes(id)) {
      toAdd.push(id);
    }
  }

  for (const id of toAdd) {
    await callbackFn(id, 'add');
  }
  for (const id of toRemove) {
    await callbackFn(id, 'remove');
  }
};
