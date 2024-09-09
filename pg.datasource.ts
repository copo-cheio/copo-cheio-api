// import {inject,lifeCycleObserver,LifeCycleObserver} from "@loopback/core";
// import {juggler} from "@loopback/repository";

// const config = {
//   name: "cc-db",
//   connector: "postgresql",

//   url: "",
//   host: "dpg-cr72mgd6l47c7382pr40-a.frankfurt-postgres.render.com",
//   port: 5432,
//   user: "pihh",
//   password: "hXHtyGLyqKyCz0jczvlfdZhZvkTSBGnw",
//   database: "cdb_4om1",
//   ssl:true,
//   "dialectOptions": {
//     "ssl": true        //<============ Add this
//   }
//   // };
// };

// // Observe application's life cycle to disconnect the datasource when
// // application is stopped. This allows the application to be shut down
// // gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// // Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
// @lifeCycleObserver("datasource")
// export class PgDataSource extends juggler.DataSource
//   implements LifeCycleObserver {
//   static dataSourceName = "pg";
//   static readonly defaultConfig = config;

//   constructor(
//     @inject("datasources.config.pg", { optional: true })
//     dsConfig: object = config
//   ) {
//     super(dsConfig);
//   }
// }
