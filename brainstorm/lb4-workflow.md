# GENERATE MIDDLEWARE:

1. Create a {file_name}.middleware.ts file in the /src/middleware folder
2. Class extends middleware and has the handle function
3. Bind it to the application.ts by adding this to the constructor
```
   // Register the middleware
    this.middleware(AdminInterceptorMiddleware);
```
