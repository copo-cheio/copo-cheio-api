import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'cc-db',
  connector: 'postgresql',

  // host: "dpg-cr72mgd6l47c7382pr40-a.frankfurt-postgres.render.com",
  // host: "dpg-cr72mgd6l47c7382pr40-a",
  // host: "dpg-cr72mgd6l47c7382pr40-a.onrender.com",
  host: 'dpg-cr72mgd6l47c7382pr40-a.frankfurt-postgres.render.com',
  // url: "",

  port: 5432,
  user: 'pihh',
  //user: "pihh",
  password: 'hXHtyGLyqKyCz0jczvlfdZhZvkTSBGnw',
  database: 'cdb_4om1',
  ssl: {
    rejectUnauthorized: false,
  },
  dialectOptions: {
    rejectUnauthorized: false,
    ssl: true, //<============ Add this
  },

  min: 2, // Minimum connections
  max: 10, // Maximum connections
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  acquireTimeoutMillis: 2000, // Timeout for acquiring a new connection

  // dpg-cr72mgd6l47c7382pr40-a.frankfurt-postgres.render.com
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class PostgresSqlDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'PostgresSql';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.PostgresSql', {optional: true})
    dsConfig: object = config,
  ) {
    /*  console.log(dsConfig); */
    super(dsConfig);
    this.on('error', err => {
      console.error('PostgreSQL connection error:', err);
    });
  }

  // ✅ Properly close connections
  async stop() {
    console.log('Closing PostgreSQL connections...');
    await super.disconnect();
  }
}

/** DEV
 *
 *
 *
const config = {
  name: 'PostgresSql',
  connector: 'postgresql',
  url: '',
  host: 'localhost',
  port: 5432,
  user: 'pihh',
  password: 'pihhrek85',
  database: 'ccdb'
};

const config ={
  name: 'PostgresSql',
  connector: 'postgresql',
  url: 'postgresql://pihh:hXHtyGLyqKyCz0jczvlfdZhZvkTSBGnw@dpg-cr72mgd6l47c7382pr40-a/cdb_4om1',
  host: 'localhost',
  port: 5432,
  user: 'pihh',
  password: 'hXHtyGLyqKyCz0jczvlfdZhZvkTSBGnw',
  database: 'cdb_4om1'

}
*/
//postgresql://pihh:hXHtyGLyqKyCz0jczvlfdZhZvkTSBGnw@dpg-cr72mgd6l47c7382pr40-a:5432/cdb_4om1
/* const ___config = {
  name: 'cc-db',
  connector: 'postgresql',

  host: 'dpg-cr72mgd6l47c7382pr40-a.frankfurt-postgres.render.com',

  url: '',

  port: 5432,
  // user: 'pihh.rocks@gmail.com',
  user: 'pihh',
  password: 'hXHtyGLyqKyCz0jczvlfdZhZvkTSBGnw',
  database: 'cdb_4om1',

  // ssl: {
  //   rejectUnauthorized: false, // This allows self-signed certificates; set it to true for stricter security
  // },
}; */

// pg admin pass f5bd4decf0539d7810f389cc8763e1a2
// dpg-cr72mgd6l47c7382pr40-a
/* const _config = {
  name: 'cc-db',
  connector: 'postgresql',
  url: 'postgresql://pihh:hXHtyGLyqKyCz0jczvlfdZhZvkTSBGnw@dpg-cr72mgd6l47c7382pr40-a.frankfurt-postgres.render.com:5432/cdb_4om1?ssl=true&sslmode=require',
};
 */
