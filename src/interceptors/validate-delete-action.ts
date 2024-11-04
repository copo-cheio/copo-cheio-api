import {Interceptor} from '@loopback/core';

export const validateDeleteAction: Interceptor = async (invocationCtx, next) => {

  // const request = invocationCtx.getSync<Request>('request');
  /**
   * @TODO
   * Will check if a post can be deleted
   */
  const request:any = invocationCtx.getSync('rest.http.request')
  const user:any = invocationCtx.getSync('security.user')

  const {headers,body}= request;
  const userId = user?.user?.id;


  const result = await next();

  return result;
};

