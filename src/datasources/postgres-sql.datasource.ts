import {inject,lifeCycleObserver,LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
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
const config = {

  name: 'cc-db',
  connector: 'postgresql',
  // url: '/pihh:hXHtyGLyqKyCz0jczvlfdZhZvkTSBGnw@dpg-cr72mgd6l47c7382pr40-a.frankfurt-postgres.render.com/cdb_4om1',
  // host: 'pg-cr72mgd6l47c7382pr40-a:5432',
  host: 'dpg-cr72mgd6l47c7382pr40-a.frankfurt-postgres.render.com',
  // dpg-cr72mgd6l47c7382pr40-a.frankfurt-postgres.render.com
  //host: '216.24.57.252',
  // port: 5432,
  // user: 'pihh',
  // password: 'hXHtyGLyqKyCz0jczvlfdZhZvkTSBGnw',
  // database: 'cdb_4om1'


  //   name: 'pgdb',
    // connector: 'postgresql',
    url: '',
    // url: 'postgresql://pihh:hXHtyGLyqKyCz0jczvlfdZhZvkTSBGnw@dpg-cr72mgd6l47c7382pr40-a.frankfurt-postgres.render.com/cdb_4om1',
    // host: 'dpg-cr72mgd6l47c7382pr40-a.frankfurt-postgres.render.com',
    port: 5432,
    // user: 'pihh.rocks@gmail.com',
    user: 'pihh',
    password: 'hXHtyGLyqKyCz0jczvlfdZhZvkTSBGnw',
    database: 'cdb_4om1'
    //database: 'postgres'
  // };

};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class PostgresSqlDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'PostgresSql';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.PostgresSql', {optional: true})
    dsConfig: object = config,
  ) {

    console.log(dsConfig)
        super(dsConfig);
  }
}
