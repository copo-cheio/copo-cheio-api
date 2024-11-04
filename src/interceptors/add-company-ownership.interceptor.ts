import {Interceptor} from '@loopback/core';

export const addCompanyOwnership: Interceptor = async (invocationCtx, next) => {
  /**
   * @TODO
   * Will add companyId to the create payload
   */
  invocationCtx.args[0].companyId= "f0eeff9a-4a59-48b7-a1e4-17ddd608b145"
  const result = await next();

  return result;
};
