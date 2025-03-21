import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import multer from 'multer';
import path from 'path';
/* import {MySequence} from "./sequence"; */

import {
  AuthenticationComponent,
  registerAuthenticationStrategy,
} from '@loopback/authentication';
import {FirebaseAuthStrategy} from './auth-strategies/firebase-strategy';
import {AclInterceptor} from './interceptors/acl.interceptor';
import {CompanyOwnershipValidation} from './interceptors/company-ownership-validation';
import {SearchInterceptor} from './interceptors/search.interceptor';
import {EncryptionProvider} from './services';
import {
  FILE_UPLOAD_SERVICE,
  STORAGE_DIRECTORY,
} from './services/FileUpload/keys';
import {MultipartFormDataBodyParser} from './utils/parser';

export {ApplicationConfig};

setInterval(() => {
  console.log('ping memory');
  console.log(process.memoryUsage());
}, 60000); // Logs every 60 seconds
export class CopoCheioServerApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.interceptor(CompanyOwnershipValidation);
    // this.interceptor(AclInterceptor);

    // Set up the custom sequence
    /* this.sequence(MySequence); */

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });

    this.component(RestExplorerComponent);
    this.component(AuthenticationComponent);
    registerAuthenticationStrategy(this, FirebaseAuthStrategy);

    this.bind('services.ACL').toProvider(AclInterceptor);
    this.bind('services.Search').toProvider(SearchInterceptor);
    this.bind('services.EncryptionProvider').toClass(EncryptionProvider);

    // Configure Uploader
    this.bodyParser(MultipartFormDataBodyParser);
    this.configureFileUpload(options.fileStorageDirectory);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    this.api({
      openapi: '3.0.0',
      info: {
        title: 'Copo cheio',
        version: '1.0.0',
      },
      paths: {},
      components: {
        securitySchemes: {
          // Add a security scheme (e.g., bearerAuth)
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    });
  }

  protected configureFileUpload(destination?: string) {
    // Upload files to `dist/.sandbox` by default
    destination = destination ?? path.join(__dirname, '../.sandbox');
    this.bind(STORAGE_DIRECTORY).to(destination);
    const multerOptions: multer.Options = {
      storage: multer.diskStorage({
        destination,
        // Use the original file name as is
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    };
    // Configure the file upload service with multer options
    this.configure(FILE_UPLOAD_SERVICE).to(multerOptions);
  }
}
