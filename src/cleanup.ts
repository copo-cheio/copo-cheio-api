

/**
 * @todo cleanup excludes @ models
 * import {Base} from '.';
 * import { Base } from './base.model';
 */
/**
 * @todo cleanup excludes @ models
 * exclude: ['id'],
 * exclude: ["id", "updated_at", "created_at"],
 */

/**
 * @todo cleanup @ controllers
 * 'application/json': {
          exclude: ["id", "updated_at", "created_at"],
          schema:

 * 'application/json': {
          exclude: ["id", "updated_at", "created_at"],
          schema:
 */

/**
 * @todo cleanup @ repositories
 *
 * at the end of the constructor
    (this.modelClass as any).observe("persist", async (ctx: any) => {
      ctx.data.updated_at = new Date();
    });
 */
